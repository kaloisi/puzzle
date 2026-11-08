import SwiftUI

extension Color {
    init(hex: UInt32, opacity: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: opacity
        )
    }

    static let puzzleAccent = Color(hex: 0x3498DB)
    static let puzzleAccentDark = Color(hex: 0x2980B9)
    static let puzzleSelection = Color(hex: 0x4A90D9)
}

/// The blue diagonal gradient used behind the menu and the board.
struct BoardBackground: View {
    var body: some View {
        LinearGradient(
            colors: [Color(hex: 0x2C3E50), Color(hex: 0x3498DB), Color(hex: 0x2C3E50)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
    }
}

/// Primary call-to-action button style (Start, Back to Menu...).
struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 18, weight: .bold))
            .foregroundStyle(.white)
            .padding(.vertical, 14)
            .padding(.horizontal, 36)
            .background(
                LinearGradient(colors: [.puzzleAccent, .puzzleAccentDark],
                               startPoint: .topLeading, endPoint: .bottomTrailing),
                in: RoundedRectangle(cornerRadius: 12, style: .continuous)
            )
            .shadow(color: Color.puzzleAccent.opacity(0.4), radius: 8, y: 4)
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

/// Square translucent button used for the in-game controls.
struct HUDButtonStyle: ButtonStyle {
    var isActive = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 20, weight: .semibold))
            .foregroundStyle(.white)
            .frame(width: 48, height: 48)
            .background(
                (isActive ? Color.puzzleAccent : Color.black.opacity(0.6)),
                in: RoundedRectangle(cornerRadius: 10, style: .continuous)
            )
            .opacity(configuration.isPressed ? 0.7 : 1)
    }
}

func formatTime(_ seconds: Int) -> String {
    String(format: "%02d:%02d", seconds / 60, seconds % 60)
}
