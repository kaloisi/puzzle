import SwiftUI

struct PuzzleBoardView: View {
    let onClose: () -> Void

    @State private var game: PuzzleGame
    @Environment(\.displayScale) private var displayScale
    @Environment(\.scenePhase) private var scenePhase
    // Gesture state resets when a gesture ends *or* is cancelled (app backgrounded,
    // system swipe, finger lifted mid-pinch), while onEnded only fires on a normal
    // end. Finishing gestures from these resets keeps the game from waiting on a
    // gesture that never ends, which left the board ignoring every drag.
    @GestureState private var isDragging = false
    @GestureState private var isMagnifying = false
    @GestureState private var isTwisting = false

    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    init(config: GameConfig, onClose: @escaping () -> Void) {
        _game = State(initialValue: PuzzleGame(config: config))
        self.onClose = onClose
    }

    var body: some View {
        ZStack {
            board
                .ignoresSafeArea()

            overlays
        }
        .statusBarHidden()
        .persistentSystemOverlays(.hidden)
        .onReceive(timer) { _ in game.tick() }
        .onChange(of: scenePhase) { _, phase in
            if phase != .active {
                game.pauseIfPlaying()
                game.saveProgress()
            }
        }
        .onChange(of: isDragging) { _, active in
            if !active { game.dragEnded() }
        }
        .onChange(of: isMagnifying) { _, active in
            if !active { game.magnifyEnded() }
        }
        .onChange(of: isTwisting) { _, active in
            if !active { game.twistEnded() }
        }
        .onDisappear {
            game.saveProgress()
            game.cancel()
        }
    }

    // MARK: - Board

    private var board: some View {
        GeometryReader { geo in
            ZStack(alignment: .topLeading) {
                BoardBackground()

                if let state = game.state {
                    PiecesLayer(state: state, sprites: game.sprites)
                        .frame(width: geo.size.width, height: geo.size.height, alignment: .topLeading)
                        .scaleEffect(game.zoom, anchor: .topLeading)
                        .offset(x: game.pan.x, y: game.pan.y)
                }

                // Single gesture surface for the whole board.
                Color.clear
                    .contentShape(Rectangle())
                    .gesture(boardGesture)
            }
            .onAppear { game.start(boardSize: geo.size, displayScale: displayScale) }
            .onChange(of: geo.size) { _, size in
                game.start(boardSize: size, displayScale: displayScale)
            }
        }
    }

    private var boardGesture: some Gesture {
        let drag = DragGesture(minimumDistance: 0, coordinateSpace: .local)
            .updating($isDragging) { _, active, _ in active = true }
            .onChanged { value in
                game.dragChanged(start: value.startLocation, location: value.location)
            }

        let magnify = MagnifyGesture()
            .updating($isMagnifying) { _, active, _ in active = true }
            .onChanged { value in
                game.magnifyChanged(magnification: value.magnification, anchor: value.startLocation)
            }

        let twist = RotateGesture()
            .updating($isTwisting) { _, active, _ in active = true }
            .onChanged { value in
                game.twistChanged(value.rotation)
            }

        return drag.simultaneously(with: magnify.simultaneously(with: twist))
    }

    // MARK: - Overlays

    @ViewBuilder
    private var overlays: some View {
        switch game.phase {
        case .loading:
            VStack(spacing: 16) {
                Text("Loading painting...")
                    .font(.system(size: 24))
                ProgressView()
                    .controlSize(.large)
                    .tint(.white)
            }
            .foregroundStyle(.white)

        case .failed(let message):
            VStack(spacing: 20) {
                Text(message)
                    .font(.system(size: 18))
                    .foregroundStyle(Color(hex: 0xFF6B6B))
                    .multilineTextAlignment(.center)
                HStack(spacing: 12) {
                    Button("Back") { onClose() }
                        .buttonStyle(PrimaryButtonStyle())
                    Button("Retry") { game.retry() }
                        .buttonStyle(PrimaryButtonStyle())
                }
            }
            .padding(32)
            .background(Color.black.opacity(0.6), in: RoundedRectangle(cornerRadius: 16))
            .padding(40)

        case .ready:
            if game.isCompleted {
                completionCard
            } else {
                hud
                if game.isPaused { pausedBadge }
            }
            if game.showOriginal, let image = game.originalImage {
                referenceImage(image)
            }
        }
    }

    private var hud: some View {
        VStack {
            HStack(alignment: .top, spacing: 10) {
                zoomControls
                if game.config.difficulty.allowsReferenceImage {
                    Button {
                        game.showOriginal = true
                    } label: {
                        Image(systemName: "photo")
                    }
                    .buttonStyle(HUDButtonStyle())
                    .accessibilityLabel("Show original image")
                }
                Spacer()
                timerControls
            }
            Spacer()
            selectionToolbar
        }
        .padding(16)
    }

    private var zoomControls: some View {
        VStack(spacing: 6) {
            Button { game.zoom(by: 1.3) } label: { Image(systemName: "plus") }
                .buttonStyle(HUDButtonStyle())
                .accessibilityLabel("Zoom in")
            Button { game.zoom(by: 1 / 1.3) } label: { Image(systemName: "minus") }
                .buttonStyle(HUDButtonStyle())
                .accessibilityLabel("Zoom out")
            if abs(game.zoom - 1) > 0.001 || game.pan != .zero {
                Button { game.resetZoom() } label: {
                    Text("\(Int((game.zoom * 100).rounded()))%")
                        .font(.system(size: 12, weight: .bold))
                }
                .buttonStyle(HUDButtonStyle())
                .accessibilityLabel("Reset zoom")
            }
        }
    }

    private var timerControls: some View {
        HStack(spacing: 10) {
            Text(formatTime(game.elapsed))
                .font(.system(size: 22).monospacedDigit())
                .foregroundStyle(.white)
                .padding(.horizontal, 16)
                .frame(minWidth: 90, minHeight: 48)
                .background(Color.black.opacity(0.6), in: RoundedRectangle(cornerRadius: 8))
            Button {
                game.togglePause()
            } label: {
                Image(systemName: game.isPaused ? "play.fill" : "pause.fill")
            }
            .buttonStyle(HUDButtonStyle())
            .accessibilityLabel(game.isPaused ? "Resume" : "Pause")
            Button {
                onClose()
            } label: {
                Image(systemName: "xmark")
            }
            .buttonStyle(HUDButtonStyle())
            .accessibilityLabel("Back to menu")
        }
    }

    private var selectionToolbar: some View {
        let canRotate = game.singleSelection != nil && game.isPlaying
        return HStack(spacing: 8) {
            Button {
                game.multiSelectMode.toggle()
            } label: {
                Image(systemName: "checklist")
            }
            .buttonStyle(HUDButtonStyle(isActive: game.multiSelectMode))
            .accessibilityLabel("Select multiple pieces")
            .accessibilityAddTraits(game.multiSelectMode ? .isSelected : [])

            Divider()
                .frame(height: 32)
                .overlay(Color.white.opacity(0.3))

            Button { game.rotateSelection(clockwise: false) } label: {
                Image(systemName: "rotate.left")
            }
            .buttonStyle(HUDButtonStyle())
            .disabled(!canRotate)
            .opacity(canRotate ? 1 : 0.4)
            .accessibilityLabel("Rotate counterclockwise")

            Button { game.rotateSelection(clockwise: true) } label: {
                Image(systemName: "rotate.right")
            }
            .buttonStyle(HUDButtonStyle())
            .disabled(!canRotate)
            .opacity(canRotate ? 1 : 0.4)
            .accessibilityLabel("Rotate clockwise")
        }
        .padding(6)
        .background(Color.black.opacity(0.35), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private var pausedBadge: some View {
        Text("Paused")
            .font(.system(size: 28))
            .foregroundStyle(.white)
            .padding(.horizontal, 48)
            .padding(.vertical, 24)
            .background(Color.black.opacity(0.6), in: RoundedRectangle(cornerRadius: 16))
            .allowsHitTesting(false)
    }

    private var completionCard: some View {
        VStack(spacing: 8) {
            Text("Congratulations!")
                .font(.system(size: 36))
            Text("You completed the puzzle in \(formatTime(game.elapsed))")
                .font(.system(size: 20))
                .opacity(0.8)
                .padding(.bottom, 16)
            HStack(spacing: 12) {
                Button("Reset") { game.reset() }
                    .buttonStyle(PrimaryButtonStyle())
                    .accessibilityHint("Shuffles the pieces to play this puzzle again")
                Button("Back to Menu") { onClose() }
                    .buttonStyle(PrimaryButtonStyle())
            }
        }
        .foregroundStyle(.white)
        .multilineTextAlignment(.center)
        .padding(.horizontal, 64)
        .padding(.vertical, 48)
        .background(Color.black.opacity(0.85), in: RoundedRectangle(cornerRadius: 20))
        .shadow(color: .black.opacity(0.5), radius: 30)
        .padding(24)
    }

    private func referenceImage(_ image: UIImage) -> some View {
        ZStack {
            Color.black.opacity(0.8)
                .ignoresSafeArea()
            Image(uiImage: image)
                .resizable()
                .scaledToFit()
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .shadow(color: .black.opacity(0.6), radius: 30, y: 20)
                .padding(60)
        }
        .contentShape(Rectangle())
        .onTapGesture { game.showOriginal = false }
        .transition(.opacity)
        .accessibilityAddTraits(.isButton)
        .accessibilityLabel("Original painting. Tap to close.")
    }
}
