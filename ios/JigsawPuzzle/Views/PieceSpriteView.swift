import SwiftUI

/// Draws all pieces/groups in z-order. Purely visual: hit testing is done by
/// `PuzzleGame` so touches can be matched against exact piece outlines.
struct PiecesLayer: View {
    let state: PuzzleState
    let sprites: [String: EntitySprite]

    var body: some View {
        let selected = Set(state.selectedIDs)
        let showHandle = selected.count == 1
        ZStack(alignment: .topLeading) {
            ForEach(state.drawOrder) { entity in
                if let sprite = sprites[entity.id] {
                    let isSelected = selected.contains(entity.id)
                    PieceSpriteView(
                        sprite: sprite,
                        position: entity.position,
                        rotation: entity.rotation,
                        isSelected: isSelected,
                        showHandle: isSelected && showHandle
                    )
                    .equatable()
                }
            }
        }
        .allowsHitTesting(false)
    }
}

struct PieceSpriteView: View, Equatable {
    let sprite: EntitySprite
    let position: CGPoint
    let rotation: Double
    let isSelected: Bool
    let showHandle: Bool

    static func == (lhs: PieceSpriteView, rhs: PieceSpriteView) -> Bool {
        lhs.sprite.image === rhs.sprite.image
            && lhs.position == rhs.position
            && lhs.rotation == rhs.rotation
            && lhs.isSelected == rhs.isSelected
            && lhs.showHandle == rhs.showHandle
    }

    var body: some View {
        let w = sprite.size.width
        let h = sprite.size.height

        Image(uiImage: sprite.image)
            .resizable()
            .interpolation(.high)
            .frame(width: w, height: h)
            .overlay {
                if isSelected {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(Color.puzzleSelection.opacity(0.7),
                                style: StrokeStyle(lineWidth: 1.5, dash: [4, 3]))
                        .padding(-6)
                }
            }
            .overlay(alignment: .top) {
                if showHandle {
                    RotationHandle()
                        // Circle center ends up `handleOffset` above the sprite's top edge.
                        .offset(x: sprite.anchor.x - w / 2,
                                y: -PuzzleGame.handleOffset - RotationHandle.radius)
                }
            }
            .rotationEffect(.degrees(rotation),
                            anchor: UnitPoint(x: sprite.anchor.x / w, y: sprite.anchor.y / h))
            .modifier(LiftShadow(isActive: isSelected))
            .position(x: position.x - sprite.anchor.x + w / 2,
                      y: position.y - sprite.anchor.y + h / 2)
    }
}

/// Knob on a stick, drawn above the selected piece.
private struct RotationHandle: View {
    static let radius: CGFloat = 11

    var body: some View {
        VStack(spacing: 0) {
            Circle()
                .fill(Color.puzzleSelection)
                .overlay(Circle().stroke(Color.white, lineWidth: 2))
                .overlay(
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(.white)
                )
                .frame(width: Self.radius * 2, height: Self.radius * 2)
            Rectangle()
                .fill(Color.puzzleSelection)
                .frame(width: 2, height: PuzzleGame.handleOffset - Self.radius - 6)
        }
    }
}

private struct LiftShadow: ViewModifier {
    let isActive: Bool

    func body(content: Content) -> some View {
        if isActive {
            content.shadow(color: .black.opacity(0.55), radius: 10, x: 0, y: 14)
        } else {
            content
        }
    }
}
