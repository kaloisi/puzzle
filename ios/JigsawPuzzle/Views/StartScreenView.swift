import SwiftUI

struct StartScreenView: View {
    var onStart: (GameConfig) -> Void

    @State private var difficulty: Difficulty = .normal
    @State private var date: Date = Calendar.current.startOfDay(for: Date())

    private var dateRange: ClosedRange<Date> {
        let today = Calendar.current.startOfDay(for: Date())
        let first = GameConfig.firstPuzzleDate
        return first...max(first, today)
    }

    var body: some View {
        ZStack {
            BoardBackground()

            GeometryReader { geo in
                ScrollView {
                    card
                        .frame(maxWidth: .infinity)
                        .frame(minHeight: geo.size.height)
                }
                .scrollBounceBehavior(.basedOnSize)
            }
        }
    }

    private var card: some View {
        VStack(spacing: 28) {
            Text("Jigsaw Puzzle")
                .font(.system(size: 34, weight: .bold))
                .foregroundStyle(.white)

            VStack(alignment: .leading, spacing: 8) {
                sectionLabel("Difficulty")
                difficultyPicker
            }

            VStack(alignment: .leading, spacing: 8) {
                sectionLabel("Select a date")
                DatePicker("Puzzle date", selection: $date, in: dateRange, displayedComponents: .date)
                    .datePickerStyle(.graphical)
                    .labelsHidden()
                    .tint(.puzzleAccent)
                    .padding(12)
                    .background(Color.white.opacity(0.07),
                                in: RoundedRectangle(cornerRadius: 12, style: .continuous))
            }

            Button {
                onStart(GameConfig(date: date, difficulty: difficulty))
            } label: {
                Text("Start").frame(maxWidth: .infinity)
            }
            .buttonStyle(PrimaryButtonStyle())
        }
        .padding(.horizontal, 40)
        .padding(.vertical, 36)
        .frame(width: 460)
        .background(Color.black.opacity(0.55), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(Color.white.opacity(0.1), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.4), radius: 30, y: 20)
        .padding(24)
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
