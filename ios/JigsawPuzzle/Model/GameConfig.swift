import Foundation

enum Difficulty: String, CaseIterable, Identifiable {
    case easy
    case normal
    case hard

    var id: String { rawValue }

    var title: String { rawValue.capitalized }

    var pieceCount: Int {
        switch self {
        case .easy: return 75
        case .normal: return 150
        case .hard: return 250
        }
    }

    /// Whether the "show original image" reference is available.
    var allowsReferenceImage: Bool { self != .hard }
}

struct GameConfig: Identifiable, Equatable {
    static let imageBaseURL = URL(string: "https://puzzle.white-hat-de0d.workers.dev")!

    /// First day a daily puzzle image exists.
    static let firstPuzzleDate: Date = {
        let components = DateComponents(year: 2026, month: 2, day: 22)
        return Calendar.current.date(from: components) ?? Date()
    }()

    let id = UUID()
    let date: Date
    let difficulty: Difficulty

    var pieceCount: Int { difficulty.pieceCount }

    var imageURL: URL {
        Self.imageBaseURL.appendingPathComponent(Self.dayString(for: date))
    }

    /// `yyyy-MM-dd` in the user's local calendar, matching the web app.
    static func dayString(for date: Date) -> String {
        let c = Calendar.current.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
    }
}
