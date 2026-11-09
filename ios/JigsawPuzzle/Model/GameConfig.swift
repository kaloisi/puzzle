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
    static let imagesListURL = URL(string: "https://puzzle.white-hat-de0d.workers.dev/all")!

    let id = UUID()
    let imageURL: URL
    let difficulty: Difficulty

    var pieceCount: Int { difficulty.pieceCount }

    /// The same image at a size suited to the start screen carousel.
    static func thumbnailURL(for url: URL) -> URL {
        guard var components = URLComponents(url: url, resolvingAgainstBaseURL: false) else { return url }
        components.queryItems = [URLQueryItem(name: "width", value: "480")]
        return components.url ?? url
    }
}
