# Jigsaw Puzzle for iPad (native Swift)

A 100% native SwiftUI port of the web jigsaw puzzle in `../src`. It has no
web views and no third-party dependencies, only SwiftUI, UIKit and CoreGraphics.

## Requirements

- Xcode 16 or later (the project uses Xcode 16 folder-synchronized groups)
- iPadOS 17 or later (iPad only)

## Running

1. Open `ios/JigsawPuzzle.xcodeproj` in Xcode.
2. Select the **JigsawPuzzle** scheme and an iPad simulator or a connected iPad.
3. To run on a real device, choose your team under
   *Signing & Capabilities* (and change the bundle identifier if needed).
4. Press **Run** (⌘R).

From the command line:

```bash
xcodebuild build -project ios/JigsawPuzzle.xcodeproj -scheme JigsawPuzzle -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO
```

## Features (same as the web version)

- Start screen with difficulty (Easy 75, Normal 150, Hard 250 pieces) and a
  calendar to pick the daily painting (from Feb 22, 2026 to today).
- Painting loaded from the same image service as the web app
  (`https://puzzle.white-hat-de0d.workers.dev/<yyyy-MM-dd>`).
- Classic tab/blank jigsaw pieces scattered and randomly rotated in 15° steps.
- Pieces snap together (within 20 pt and 15°) into groups, with chain reactions.
- Timer with pause/resume. The timer also pauses when the app goes to the background.
- Zoom in, zoom out and reset, plus a reference image on Easy and Normal.
- A completion screen when every piece is joined.

## iPad controls

| Action | Gesture |
| --- | --- |
| Select / move a piece or group | Touch and drag it |
| Rotate the selected piece | Drag the round handle above it, twist with two fingers, or use the ↺ / ↻ buttons (45° steps) |
| Pan the board | Drag empty space |
| Zoom | Pinch, or use the + / − buttons |
| Deselect | Tap empty space |
| Select several pieces | Turn on the checklist button, then tap pieces. Dragging any selected piece moves them all |

When you finish a rotation within 10° of a right angle, it snaps to that angle, as on the web.

## Code layout

```
JigsawPuzzle/
  JigsawPuzzleApp.swift      App entry point and root navigation
  Model/
    Geometry.swift           Point/angle helpers
    PuzzleGenerator.swift    Grid + bezier tab/blank piece outlines (CGPath)
    PuzzleState.swift        Entities, selection, hit testing, snapping rules
    PuzzleGame.swift         @Observable view model: loading, zoom/pan, timer, gestures
    GameConfig.swift         Difficulty and image URL
  Rendering/
    SpriteRenderer.swift     Pre-renders each piece/group into a bitmap
  Views/
    StartScreenView.swift    Difficulty + date picker
    PuzzleBoardView.swift    Board, gestures and HUD overlays
    PieceSpriteView.swift    Piece drawing, selection outline and rotation handle
    Theme.swift              Colors and button styles
```

Each piece, and each merged group, is rendered once into a clipped bitmap.
After that, moving and rotating pieces only changes view transforms. One
gesture surface covers the board, and touches are matched against the exact
piece outlines.
