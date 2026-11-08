import CoreGraphics
import Foundation

/// A movable thing on the board: either a single piece or a merged group of pieces.
struct PuzzleEntity: Identifiable, Equatable {
    let id: String
    var pieceIDs: [Int]
    /// Center of the entity in image space.
    var centroid: CGPoint
    /// Where the centroid currently sits on the board (board points, before zoom).
    var position: CGPoint
    /// Rotation in degrees, [0, 360).
    var rotation: Double
    var zIndex: Int
}

/// Pure game state and rules (selection, movement, snapping), independent of UI.
struct PuzzleState: @unchecked Sendable {
    static let snapDistance: CGFloat = 20
    static let snapAngle: Double = 15

    let layout: PuzzleLayout
    /// Board points per image pixel.
    let scale: CGFloat

    private(set) var entities: [PuzzleEntity]
    private(set) var selectedIDs: [String] = []
    private(set) var isCompleted = false
    private var nextZ: Int

    init(layout: PuzzleLayout, boardSize: CGSize) {
        self.layout = layout
        let imageSize = layout.imageSize
        scale = min(boardSize.width * 0.6 / imageSize.width,
                    boardSize.height * 0.6 / imageSize.height)

        let padding: CGFloat = 60
        let spanX = max(0, boardSize.width - 2 * padding)
        let spanY = max(0, boardSize.height - 2 * padding)
        let total = layout.pieces.count

        entities = layout.pieces.map { piece in
            PuzzleEntity(
                id: "piece-\(piece.id)",
                pieceIDs: [piece.id],
                centroid: piece.centroid,
                position: CGPoint(x: padding + CGFloat.random(in: 0...1) * spanX,
                                  y: padding + CGFloat.random(in: 0...1) * spanY),
                // Multiples of 15 degrees for easier snapping
                rotation: Double(Int.random(in: 0..<24) * 15),
                zIndex: total - 1
            )
        }
        nextZ = total
    }

    // MARK: - Queries

    func entity(_ id: String) -> PuzzleEntity? {
        entities.first { $0.id == id }
    }

    /// Entities in back-to-front drawing order: larger groups at the bottom,
    /// then by z-index, with selected entities always on top.
    var drawOrder: [PuzzleEntity] {
        let selected = Set(selectedIDs)
        return entities.enumerated().sorted { a, b in
            let aSel = selected.contains(a.element.id)
            let bSel = selected.contains(b.element.id)
            if aSel != bSel { return !aSel }
            if a.element.pieceIDs.count != b.element.pieceIDs.count {
                return a.element.pieceIDs.count > b.element.pieceIDs.count
            }
            if a.element.zIndex != b.element.zIndex {
                return a.element.zIndex < b.element.zIndex
            }
            return a.offset < b.offset
        }.map(\.element)
    }

    /// Convert a board point into the image-space coordinates of `entity`.
    func imagePoint(_ boardPoint: CGPoint, in entity: PuzzleEntity) -> CGPoint {
        let local = (boardPoint - entity.position).rotated(byDegrees: -entity.rotation)
        return entity.centroid + local / scale
    }

    /// Topmost entity under `boardPoint`. Exact piece outlines win; if nothing is
    /// hit exactly, a piece whose tab-expanded bounds contain the point is
    /// accepted, which makes small pieces easier to grab with a finger.
    func entityID(at boardPoint: CGPoint) -> String? {
        let order = drawOrder.reversed()
        for e in order {
            let p = imagePoint(boardPoint, in: e)
            for pid in e.pieceIDs {
                let piece = layout.pieces[pid]
                if piece.bounds.contains(p) && piece.path.contains(p) { return e.id }
            }
        }
        for e in order {
            let p = imagePoint(boardPoint, in: e)
            if e.pieceIDs.contains(where: { layout.pieces[$0].bounds.contains(p) }) { return e.id }
        }
        return nil
    }

    // MARK: - Selection

    mutating func select(_ id: String, additive: Bool) {
        if additive {
            if !selectedIDs.contains(id) { selectedIDs.append(id) }
        } else {
            selectedIDs = [id]
        }
        bringToFront(id)
    }

    mutating func deselect(_ id: String) {
        selectedIDs.removeAll { $0 == id }
    }

    mutating func clearSelection() {
        selectedIDs.removeAll()
    }

    private mutating func bringToFront(_ id: String) {
        guard let i = entities.firstIndex(where: { $0.id == id }) else { return }
        entities[i].zIndex = nextZ
        nextZ += 1
    }

    // MARK: - Movement

    mutating func move(_ id: String, by delta: CGPoint) {
        guard let i = entities.firstIndex(where: { $0.id == id }) else { return }
        entities[i].position = entities[i].position + delta
    }

    mutating func moveSelected(by delta: CGPoint) {
        let ids = Set(selectedIDs)
        for i in entities.indices where ids.contains(entities[i].id) {
            entities[i].position = entities[i].position + delta
        }
    }

    mutating func setRotation(_ id: String, degrees: Double) {
        guard let i = entities.firstIndex(where: { $0.id == id }) else { return }
        entities[i].rotation = normalizedDegrees(degrees)
    }

    /// Snap rotation to the nearest right angle when within 10 degrees of it.
    mutating func snapRotationToRightAngle(_ id: String) {
        guard let e = entity(id) else { return }
        let nearest = (e.rotation / 90).rounded() * 90
        if abs(e.rotation - nearest) <= 10 {
            setRotation(id, degrees: nearest)
        }
    }

    // MARK: - Snapping

    /// Try to join `id` with matching neighbors, repeatedly (chain reaction).
    /// Returns true if anything merged.
    @discardableResult
    mutating func trySnap(_ id: String) -> Bool {
        var current = id
        var merged = false
        while let newID = snapOnce(current) {
            merged = true
            current = newID
        }
        return merged
    }

    /// Snap every selected entity (used after a multi-selection drag).
    mutating func trySnapSelected() {
        for id in selectedIDs where entity(id) != nil {
            trySnap(id)
        }
    }

    private mutating func snapOnce(_ activeID: String) -> String? {
        guard let ai = entities.firstIndex(where: { $0.id == activeID }) else { return nil }
        let active = entities[ai]

        var owner: [Int: Int] = [:]
        for (i, e) in entities.enumerated() {
            for pid in e.pieceIDs { owner[pid] = i }
        }

        let activeSet = Set(active.pieceIDs)
        var checked = Set<Int>()

        for pid in active.pieceIDs {
            for nid in layout.pieces[pid].neighbors where !activeSet.contains(nid) {
                guard let ni = owner[nid], ni != ai, checked.insert(ni).inserted else { continue }
                let neighbor = entities[ni]

                guard angularDifference(active.rotation, neighbor.rotation) <= Self.snapAngle else {
                    continue
                }

                // Where the neighbor's centroid should be if it were attached to `active`.
                let offset = ((neighbor.centroid - active.centroid) * scale)
                    .rotated(byDegrees: active.rotation)
                let expected = active.position + offset
                guard expected.distance(to: neighbor.position) <= Self.snapDistance else { continue }

                return merge(activeIndex: ai, neighborIndex: ni)
            }
        }
        return nil
    }

    private mutating func merge(activeIndex ai: Int, neighborIndex ni: Int) -> String {
        let active = entities[ai]
        let neighbor = entities[ni]
        let pieceIDs = active.pieceIDs + neighbor.pieceIDs

        var sum = CGPoint.zero
        for pid in pieceIDs { sum = sum + layout.pieces[pid].centroid }
        let centroid = sum / CGFloat(pieceIDs.count)

        let offset = ((centroid - active.centroid) * scale).rotated(byDegrees: active.rotation)
        let group = PuzzleEntity(
            id: "group-\(UUID().uuidString)",
            pieceIDs: pieceIDs,
            centroid: centroid,
            position: active.position + offset,
            rotation: active.rotation,
            zIndex: max(active.zIndex, neighbor.zIndex)
        )

        for index in [ai, ni].sorted(by: >) {
            entities.remove(at: index)
        }
        entities.append(group)

        if selectedIDs.contains(active.id) {
            selectedIDs.removeAll { $0 == active.id || $0 == neighbor.id }
            selectedIDs.append(group.id)
        } else {
            selectedIDs.removeAll { $0 == neighbor.id }
        }

        isCompleted = pieceIDs.count == layout.pieces.count
        return group.id
    }
}
