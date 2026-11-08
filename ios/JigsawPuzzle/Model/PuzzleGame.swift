import Observation
import SwiftUI
import UIKit

/// View model for one puzzle session: loading, board state, sprites,
/// zoom/pan, timer and gesture handling.
@MainActor
@Observable
final class PuzzleGame {
    enum Phase: Equatable {
        case loading
        case ready
        case failed(String)
    }

    static let minZoom: CGFloat = 0.25
    static let maxZoom: CGFloat = 5
    /// Touch radius of the rotation handle, in screen points.
    static let handleHitRadius: CGFloat = 30
    /// Distance of the rotation handle's center above the sprite's top edge, in board points.
    static let handleOffset: CGFloat = 36

    let config: GameConfig

    private(set) var phase: Phase = .loading
    private(set) var state: PuzzleState?
    private(set) var sprites: [String: EntitySprite] = [:]
    private(set) var originalImage: UIImage?

    var zoom: CGFloat = 1
    var pan: CGPoint = .zero
    private(set) var isPaused = false
    private(set) var elapsed = 0
    var showOriginal = false
    var multiSelectMode = false

    // MARK: Non-observed working state

    private enum DragMode {
        case pan(startPan: CGPoint)
        case piece(id: String, last: CGPoint, toggleOnTap: Bool)
        case rotate(id: String, startRotation: Double, startAngle: Double)
        case ignored
    }

    @ObservationIgnored private var renderer: SpriteRenderer?
    @ObservationIgnored private var boardSize: CGSize = .zero
    @ObservationIgnored private var displayScale: CGFloat = 2
    @ObservationIgnored private var loadTask: Task<Void, Never>?
    @ObservationIgnored private var dragMode: DragMode?
    @ObservationIgnored private var dragMoved = false
    @ObservationIgnored private var pinchStart: (zoom: CGFloat, pan: CGPoint)?
    @ObservationIgnored private var twistStart: (id: String?, rotation: Double)?

    init(config: GameConfig) {
        self.config = config
    }

    var isPlaying: Bool {
        phase == .ready && !isPaused && !(state?.isCompleted ?? true)
    }

    var isCompleted: Bool { state?.isCompleted ?? false }

    /// The single selected entity, if exactly one is selected.
    var singleSelection: PuzzleEntity? {
        guard let state, state.selectedIDs.count == 1 else { return nil }
        return state.entity(state.selectedIDs[0])
    }

    // MARK: - Loading

    /// Starts loading once the board has a size. Safe to call repeatedly.
    func start(boardSize: CGSize, displayScale: CGFloat) {
        guard loadTask == nil, boardSize.width > 0, boardSize.height > 0 else { return }
        self.boardSize = boardSize
        self.displayScale = displayScale
        phase = .loading

        let url = config.imageURL
        let pieceCount = config.pieceCount
        // Render a bit above screen resolution so pieces stay crisp when zoomed in.
        let pixelScale = min(3, max(1, displayScale) * 1.5)

        loadTask = Task { [weak self] in
            do {
                let (data, response) = try await URLSession.shared.data(from: url)
                if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
                    throw URLError(.badServerResponse)
                }
                guard let image = UIImage(data: data), image.size.width > 0, image.size.height > 0 else {
                    throw URLError(.cannotDecodeContentData)
                }

                let prepared = await Task.detached(priority: .userInitiated) {
                    Self.prepare(image: image, pieceCount: pieceCount,
                                 boardSize: boardSize, pixelScale: pixelScale)
                }.value

                guard let self, !Task.isCancelled else { return }
                self.originalImage = image
                self.renderer = prepared.renderer
                self.sprites = prepared.sprites
                self.state = prepared.state
                self.phase = .ready
            } catch {
                guard let self, !Task.isCancelled else { return }
                self.phase = .failed("Failed to load the painting image. Please check your connection and try again.")
            }
        }
    }

    func retry() {
        loadTask?.cancel()
        loadTask = nil
        start(boardSize: boardSize, displayScale: displayScale)
    }

    func cancel() {
        loadTask?.cancel()
    }

    private struct Prepared: @unchecked Sendable {
        let state: PuzzleState
        let renderer: SpriteRenderer
        let sprites: [String: EntitySprite]
    }

    nonisolated private static func prepare(
        image: UIImage, pieceCount: Int, boardSize: CGSize, pixelScale: CGFloat
    ) -> Prepared {
        let layout = PuzzleGenerator.makeLayout(imageSize: image.size, pieceCount: pieceCount)
        let state = PuzzleState(layout: layout, boardSize: boardSize)
        let renderer = SpriteRenderer(image: image, layout: layout,
                                      scale: state.scale, pixelScale: pixelScale)
        var sprites: [String: EntitySprite] = [:]
        for entity in state.entities {
            sprites[entity.id] = renderer.sprite(for: entity)
        }
        return Prepared(state: state, renderer: renderer, sprites: sprites)
    }

    /// Render sprites for newly merged groups and drop sprites of entities that no longer exist.
    private func refreshSprites() {
        guard let state, let renderer else { return }
        let live = Set(state.entities.map(\.id))
        var updated = sprites.filter { live.contains($0.key) }
        for entity in state.entities where updated[entity.id] == nil {
            updated[entity.id] = renderer.sprite(for: entity)
        }
        if updated.count != sprites.count || updated.keys.contains(where: { sprites[$0] == nil }) {
            sprites = updated
        }
    }

    // MARK: - Timer / pause

    func tick() {
        if isPlaying { elapsed += 1 }
    }

    func togglePause() {
        guard phase == .ready, !isCompleted else { return }
        isPaused.toggle()
        if isPaused { cancelGestures() }
    }

    func pauseIfPlaying() {
        if isPlaying {
            isPaused = true
            cancelGestures()
        }
    }

    private func cancelGestures() {
        if dragMode != nil { dragMode = .ignored }
        if twistStart != nil { twistStart = (nil, 0) }
    }

    // MARK: - Zoom

    func boardPoint(fromScreen p: CGPoint) -> CGPoint {
        CGPoint(x: (p.x - pan.x) / zoom, y: (p.y - pan.y) / zoom)
    }

    func zoom(by factor: CGFloat) {
        let center = CGPoint(x: boardSize.width / 2, y: boardSize.height / 2)
        setZoom(zoom * factor, around: center, fromZoom: zoom, fromPan: pan)
    }

    func resetZoom() {
        zoom = 1
        pan = .zero
    }

    private func setZoom(_ newZoom: CGFloat, around anchor: CGPoint, fromZoom: CGFloat, fromPan: CGPoint) {
        let clamped = min(Self.maxZoom, max(Self.minZoom, newZoom))
        let k = clamped / fromZoom
        pan = anchor - (anchor - fromPan) * k
        zoom = clamped
    }

    // MARK: - Rotation helpers

    /// Center of the rotation handle for `entity`, in board coordinates.
    func handlePoint(for entity: PuzzleEntity) -> CGPoint? {
        guard let sprite = sprites[entity.id] else { return nil }
        let local = CGPoint(x: 0, y: -Self.handleOffset - sprite.anchor.y)
        return entity.position + local.rotated(byDegrees: entity.rotation)
    }

    /// Rotate the single selected entity to the next/previous multiple of 45 degrees.
    func rotateSelection(clockwise: Bool) {
        guard isPlaying, let entity = singleSelection else { return }
        let step = 45.0
        let target = clockwise
            ? (floor(entity.rotation / step + 1e-9) + 1) * step
            : (ceil(entity.rotation / step - 1e-9) - 1) * step
        state?.setRotation(entity.id, degrees: target)
        finishRotation(entity.id, snapToRightAngle: false)
    }

    private func finishRotation(_ id: String, snapToRightAngle: Bool) {
        if snapToRightAngle { state?.snapRotationToRightAngle(id) }
        state?.trySnap(id)
        refreshSprites()
    }

    // MARK: - One-finger drag (select / move / rotate handle / pan)

    func dragChanged(start: CGPoint, location: CGPoint) {
        guard state != nil else { return }
        if dragMode == nil { beginDrag(at: start) }

        let translation = location - start
        if abs(translation.x) > 4 || abs(translation.y) > 4 { dragMoved = true }

        guard let mode = dragMode else { return }
        switch mode {
        case .pan(let startPan):
            pan = startPan + translation

        case .piece(let id, let last, let toggleOnTap):
            let p = boardPoint(fromScreen: location)
            let delta = p - last
            dragMode = .piece(id: id, last: p, toggleOnTap: toggleOnTap)
            guard let st = state else { return }
            if st.selectedIDs.count > 1 && st.selectedIDs.contains(id) {
                state?.moveSelected(by: delta)
            } else {
                state?.move(id, by: delta)
            }

        case .rotate(let id, let startRotation, let startAngle):
            guard let entity = state?.entity(id) else { return }
            let angle = angleDegrees(from: entity.position, to: boardPoint(fromScreen: location))
            state?.setRotation(id, degrees: startRotation + angle - startAngle)

        case .ignored:
            break
        }
    }

    func dragEnded() {
        defer {
            dragMode = nil
            dragMoved = false
        }
        guard let mode = dragMode else { return }

        switch mode {
        case .pan:
            if !dragMoved { state?.clearSelection() }

        case .piece(let id, _, let toggleOnTap):
            if toggleOnTap && !dragMoved {
                state?.deselect(id)
            } else if let st = state, st.selectedIDs.count > 1, st.selectedIDs.contains(id) {
                state?.trySnapSelected()
                refreshSprites()
            } else {
                state?.trySnap(id)
                refreshSprites()
            }

        case .rotate(let id, _, _):
            finishRotation(id, snapToRightAngle: true)

        case .ignored:
            break
        }
    }

    private func beginDrag(at screenPoint: CGPoint) {
        guard isPlaying, let st = state, pinchStart == nil, twistStart == nil else {
            dragMode = .ignored
            return
        }
        let p = boardPoint(fromScreen: screenPoint)

        // Rotation handle of the single selected entity
        if let entity = singleSelection, let handle = handlePoint(for: entity),
           handle.distance(to: p) <= Self.handleHitRadius / zoom {
            dragMode = .rotate(id: entity.id, startRotation: entity.rotation,
                               startAngle: angleDegrees(from: entity.position, to: p))
            return
        }

        guard let id = st.entityID(at: p) else {
            dragMode = .pan(startPan: pan)
            return
        }

        if multiSelectMode {
            if st.selectedIDs.contains(id) {
                // Tap toggles it off; a drag moves the whole selection.
                dragMode = .piece(id: id, last: p, toggleOnTap: true)
            } else {
                state?.select(id, additive: true)
                dragMode = .piece(id: id, last: p, toggleOnTap: false)
            }
        } else {
            state?.select(id, additive: false)
            dragMode = .piece(id: id, last: p, toggleOnTap: false)
        }
    }

    // MARK: - Two-finger gestures

    func magnifyChanged(magnification: CGFloat, anchor: CGPoint) {
        guard phase == .ready else { return }
        if pinchStart == nil {
            pinchStart = (zoom, pan)
            // A pinch that began as a background pan should not keep panning or deselect.
            if case .pan = dragMode { dragMode = .ignored }
        }
        guard let start = pinchStart else { return }
        setZoom(start.zoom * magnification, around: anchor, fromZoom: start.zoom, fromPan: start.pan)
    }

    func magnifyEnded() {
        pinchStart = nil
    }

    /// Two-finger twist rotates the single selected entity.
    func twistChanged(_ angle: Angle) {
        if twistStart == nil {
            if isPlaying, let entity = singleSelection {
                twistStart = (entity.id, entity.rotation)
            } else {
                twistStart = (nil, 0)
            }
        }
        guard let start = twistStart, let id = start.id else { return }
        state?.setRotation(id, degrees: start.rotation + angle.degrees)
    }

    func twistEnded() {
        defer { twistStart = nil }
        guard let id = twistStart?.id else { return }
        finishRotation(id, snapToRightAngle: true)
    }
}
