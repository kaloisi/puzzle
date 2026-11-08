import SwiftUI

@main
struct JigsawPuzzleApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}

struct RootView: View {
    @State private var config: GameConfig?

    var body: some View {
        Group {
            if let config {
                PuzzleBoardView(config: config) {
                    self.config = nil
                }
                .id(config.id)
                .transition(.opacity)
            } else {
                StartScreenView { newConfig in
                    self.config = newConfig
                }
                .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.25), value: config?.id)
        .preferredColorScheme(.dark)
    }
}
