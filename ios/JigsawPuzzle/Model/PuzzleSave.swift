import CoreGraphics
import CryptoKit
import Foundation

/// A saved board: enough to rebuild the same pieces exactly where the player left them.
struct SavedPuzzle: Codable, Sendable {
    struct Entity: Codable, Sendable {
        var pieceIDs: [Int]
        var position: CGPoint
        var rotation: Double
        var zIndex: Int
    }

    var edges: PuzzleEdges
    /// Board points per image pixel when the board was created.
    var scale: CGFloat
    var entities: [Entity]
    var elapsed: Int
    var zoom: CGFloat
    var pan: CGPoint
    var isCompleted: Bool
}

enum PuzzleProgress: String {
    case inProgress
    case solved
}

/// Stores one saved board per painting and difficulty as a JSON file, plus a
/// small progress index the start screen reads without loading every board.
enum PuzzleSaveStore {
    private static let progressKey = "puzzleProgress"

    static func key(imageURL: URL, difficulty: Difficulty) -> String {
        "\(difficulty.rawValue)|\(imageURL.absoluteString)"
    }

    static func load(for config: GameConfig) -> SavedPuzzle? {
        guard let data = try? Data(contentsOf: fileURL(for: config)) else { return nil }
        return try? JSONDecoder().decode(SavedPuzzle.self, from: data)
    }

    static func save(_ puzzle: SavedPuzzle, for config: GameConfig) {
        let url = fileURL(for: config)
        do {
            try FileManager.default.createDirectory(at: url.deletingLastPathComponent(),
                                                    withIntermediateDirectories: true)
            try JSONEncoder().encode(puzzle).write(to: url, options: .atomic)
        } catch {
            // A failed save only costs the player their resume point; keep playing.
            return
        }
        setProgress(puzzle.isCompleted ? .solved : .inProgress, for: config)
    }

    static func delete(for config: GameConfig) {
        try? FileManager.default.removeItem(at: fileURL(for: config))
        setProgress(nil, for: config)
    }

    /// Progress of every saved board, keyed by `key(imageURL:difficulty:)`.
    static func allProgress() -> [String: PuzzleProgress] {
        let raw = UserDefaults.standard.dictionary(forKey: progressKey) as? [String: String] ?? [:]
        return raw.compactMapValues(PuzzleProgress.init(rawValue:))
    }

    private static func setProgress(_ progress: PuzzleProgress?, for config: GameConfig) {
        var raw = UserDefaults.standard.dictionary(forKey: progressKey) as? [String: String] ?? [:]
        raw[key(for: config)] = progress?.rawValue
        UserDefaults.standard.set(raw, forKey: progressKey)
    }

    private static func key(for config: GameConfig) -> String {
        key(imageURL: config.imageURL, difficulty: config.difficulty)
    }

    private static func fileURL(for config: GameConfig) -> URL {
        let digest = SHA256.hash(data: Data(key(for: config).utf8))
        let name = digest.map { String(format: "%02x", $0) }.joined()
        return URL.applicationSupportDirectory
            .appending(path: "SavedPuzzles", directoryHint: .isDirectory)
            .appending(path: "\(name).json")
    }
}
