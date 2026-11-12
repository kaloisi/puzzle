import SwiftUI

struct StartScreenView: View {
    var onStart: (GameConfig) -> Void

    @State private var difficulty: Difficulty = .normal
    @State private var images: [URL]?
    @State private var selectedImage: URL?
    @State private var loadFailed = false
    @State private var progress: [String: PuzzleProgress] = [:]

    var body: some View {
        ZStack {
            BoardBackground()

            GeometryReader { geo in
                ScrollView {
                    card(width: cardWidth(for: geo.size))
                        .frame(maxWidth: .infinity)
                        .frame(minHeight: geo.size.height)
                }
                .scrollBounceBehavior(.basedOnSize)
            }
        }
    }

    private func cardWidth(for size: CGSize) -> CGFloat {
        size.width > size.height ? min(760, size.width - 48) : 460
    }

    private func card(width: CGFloat) -> some View {
        VStack(spacing: 28) {
            Text("Jigsaw Puzzle")
                .font(.system(size: 34, weight: .bold))
                .foregroundStyle(.white)

            VStack(alignment: .leading, spacing: 8) {
                sectionLabel("Difficulty")
                difficultyPicker
            }

            VStack(alignment: .leading, spacing: 8) {
                sectionLabel("Choose an image")
                carousel
                    .frame(height: 174)
                    .frame(maxWidth: .infinity)
                    .background(Color.white.opacity(0.07),
                                in: RoundedRectangle(cornerRadius: 12, style: .continuous))
            }

            Button {
                if let selectedImage {
                    onStart(GameConfig(imageURL: selectedImage, difficulty: difficulty))
                }
            } label: {
                Text(selectedImage.flatMap(progress(for:)) == .inProgress ? "Resume" : "Start")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(PrimaryButtonStyle())
            .disabled(selectedImage == nil)
            .opacity(selectedImage == nil ? 0.5 : 1)
        }
        .padding(.horizontal, 40)
        .padding(.vertical, 36)
        .frame(width: width)
        .background(Color.black.opacity(0.55), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(Color.white.opacity(0.1), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.4), radius: 30, y: 20)
        .padding(24)
        .task {
            progress = PuzzleSaveStore.allProgress()
            await loadImages()
        }
    }

    @ViewBuilder
    private var carousel: some View {
        if loadFailed {
            VStack(spacing: 8) {
                Text("Couldn't load images.")
                    .foregroundStyle(.white.opacity(0.6))
                Button("Try again") {
                    loadFailed = false
                    Task { await loadImages() }
                }
                .tint(.puzzleAccent)
            }
        } else if let images {
            ScrollViewReader { proxy in
                ScrollView(.horizontal, showsIndicators: false) {
                    LazyHStack(spacing: 8) {
                        let ordered = sortedByProgress(images)
                        ForEach(Array(ordered.enumerated()), id: \.element) { index, url in
                            thumbnail(url, index: index, total: ordered.count)
                                .id(url)
                        }
                    }
                    .padding(12)
                }
                .onChange(of: selectedImage) { _, newValue in
                    withAnimation { proxy.scrollTo(newValue, anchor: .center) }
                }
                .onChange(of: difficulty) {
                    withAnimation { proxy.scrollTo(selectedImage, anchor: .center) }
                }
            }
        } else {
            ProgressView().tint(.white)
        }
    }

    private func thumbnail(_ url: URL, index: Int, total: Int) -> some View {
        let isSelected = url == selectedImage
        return Button {
            selectedImage = url
        } label: {
            AsyncImage(url: GameConfig.thumbnailURL(for: url)) { image in
                image.resizable().scaledToFill()
            } placeholder: {
                Color.black.opacity(0.3)
            }
            .frame(width: 200, height: 150)
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            .overlay(alignment: .bottomLeading) {
                if let status = progress(for: url) {
                    progressBadge(status).padding(8)
                }
            }
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .stroke(isSelected ? Color.puzzleAccent : Color.clear, lineWidth: 3)
            )
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Image \(index + 1) of \(total)")
        .accessibilityValue(progress(for: url).map(progressTitle) ?? "")
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }

    /// Progress of `url` at the selected difficulty.
    private func progress(for url: URL) -> PuzzleProgress? {
        progress[PuzzleSaveStore.key(imageURL: url, difficulty: difficulty)]
    }

    /// In-progress paintings first, then never played, then solved; otherwise in list order.
    private func sortedByProgress(_ images: [URL]) -> [URL] {
        func rank(_ url: URL) -> Int {
            switch progress(for: url) {
            case .inProgress: return 0
            case nil: return 1
            case .solved: return 2
            }
        }
        return images.enumerated()
            .sorted { (rank($0.element), $0.offset) < (rank($1.element), $1.offset) }
            .map(\.element)
    }

    private func progressTitle(_ status: PuzzleProgress) -> String {
        status == .solved ? "Solved" : "In progress"
    }

    private func progressBadge(_ status: PuzzleProgress) -> some View {
        Label(progressTitle(status),
              systemImage: status == .solved ? "checkmark.circle.fill" : "hourglass")
            .font(.system(size: 12, weight: .semibold))
            .foregroundStyle(status == .solved ? Color.green : Color.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Color.black.opacity(0.7), in: Capsule())
    }

    private struct ImageRow: Decodable {
        let url: URL
    }

    private func loadImages() async {
        guard images == nil else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: GameConfig.imagesListURL)
            let rows = try JSONDecoder().decode([ImageRow].self, from: data)
            images = rows.map(\.url)
            selectedImage = sortedByProgress(images ?? []).first
        } catch {
            loadFailed = true
        }
    }

    private var difficultyPicker: some View {
        HStack(spacing: 4) {
            ForEach(Difficulty.allCases) { d in
                let isSelected = d == difficulty
                Button {
                    difficulty = d
                } label: {
                    VStack(spacing: 2) {
                        Text(d.title)
                            .font(.system(size: 16, weight: isSelected ? .bold : .medium))
                        Text("\(d.pieceCount) pcs")
                            .font(.system(size: 12))
                            .opacity(0.6)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .foregroundStyle(isSelected ? Color.white : Color.white.opacity(0.6))
                    .background(isSelected ? Color.puzzleAccent : Color.clear,
                                in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityAddTraits(isSelected ? .isSelected : [])
            }
        }
        .padding(4)
        .background(Color.white.opacity(0.07), in: RoundedRectangle(cornerRadius: 10, style: .continuous))
        .animation(.easeOut(duration: 0.15), value: difficulty)
    }

    private func sectionLabel(_ text: String) -> some View {
        Text(text.uppercased())
            .font(.system(size: 12))
            .tracking(1)
            .foregroundStyle(.white.opacity(0.6))
    }
}

#Preview {
    StartScreenView { _ in }
}
