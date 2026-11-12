import CoreGraphics
import Foundation

/// Static description of one jigsaw piece, in image-space coordinates (image pixels).
struct PieceDefinition: Identifiable, @unchecked Sendable {
    let id: Int
    let row: Int
    let col: Int
    /// Outline with bezier tab/blank edges.
    let path: CGPath
    /// Cell rectangle expanded on every side by the tab size.
    let bounds: CGRect
    /// Center of the (un-expanded) grid cell.
    let centroid: CGPoint
    /// Ids of grid neighbors (up, down, left, right).
    let neighbors: [Int]
}

/// Which way each shared edge's tab points. Kept so a saved board can be
/// rebuilt with exactly the same piece shapes.
struct PuzzleEdges: Codable, Equatable, Sendable {
    /// horizontal[r][c]: true = tab protrudes downward on the edge between row r and r+1
    var horizontal: [[Bool]]
    /// vertical[r][c]: true = tab protrudes rightward on the edge between col c and c+1
    var vertical: [[Bool]]

    static func random(rows: Int, cols: Int) -> PuzzleEdges {
        PuzzleEdges(
            horizontal: (0..<max(0, rows - 1)).map { _ in (0..<cols).map { _ in Bool.random() } },
            vertical: (0..<rows).map { _ in (0..<max(0, cols - 1)).map { _ in Bool.random() } }
        )
    }

    func fits(rows: Int, cols: Int) -> Bool {
        horizontal.count == max(0, rows - 1) && horizontal.allSatisfy { $0.count == cols }
            && vertical.count == rows && vertical.allSatisfy { $0.count == max(0, cols - 1) }
    }
}

struct PuzzleLayout: @unchecked Sendable {
    let imageSize: CGSize
    let rows: Int
    let cols: Int
    let edges: PuzzleEdges
    /// Indexed by piece id.
    let pieces: [PieceDefinition]
}

/// Generates a grid-based jigsaw puzzle with standard tab/blank edges.
/// Each shared edge is randomly assigned a tab or blank (unless `edges` from a
/// saved board fit the grid), and adjacent pieces always have complementary shapes.
enum PuzzleGenerator {
    static func makeLayout(imageSize: CGSize, pieceCount: Int, edges: PuzzleEdges? = nil) -> PuzzleLayout {
        let imgW = Double(imageSize.width)
        let imgH = Double(imageSize.height)

        // 1. Grid dimensions
        let cols = max(2, Int((Double(pieceCount) * imgW / imgH).squareRoot().rounded()))
        let rows = max(2, Int((Double(pieceCount) / Double(cols)).rounded()))

        let cellW = imageSize.width / CGFloat(cols)
        let cellH = imageSize.height / CGFloat(rows)
        let tabSize = min(cellW, cellH) * 0.3

        // 2. Edge directions.
        // hEdge[r][c]: +1 = tab protrudes downward on the edge between row r and r+1
        // vEdge[r][c]: +1 = tab protrudes rightward on the edge between col c and c+1
        let edges = edges.flatMap { $0.fits(rows: rows, cols: cols) ? $0 : nil }
            ?? PuzzleEdges.random(rows: rows, cols: cols)
        let hEdge: [[CGFloat]] = edges.horizontal.map { row in row.map { $0 ? 1 : -1 } }
        let vEdge: [[CGFloat]] = edges.vertical.map { row in row.map { $0 ? 1 : -1 } }

        // 3. Pieces
        var pieces: [PieceDefinition] = []
        pieces.reserveCapacity(rows * cols)

        for r in 0..<rows {
            for c in 0..<cols {
                let x0 = CGFloat(c) * cellW
                let y0 = CGFloat(r) * cellH
                let x1 = x0 + cellW
                let y1 = y0 + cellH
                let id = r * cols + c

                // +1 = tab, -1 = blank, 0 = straight border edge
                let topDir: CGFloat = r > 0 ? -hEdge[r - 1][c] : 0
                let rightDir: CGFloat = c < cols - 1 ? vEdge[r][c] : 0
                let bottomDir: CGFloat = r < rows - 1 ? hEdge[r][c] : 0
                let leftDir: CGFloat = c > 0 ? -vEdge[r][c - 1] : 0

                let path = CGMutablePath()
                path.move(to: CGPoint(x: x0, y: y0))
                addHorizontalEdge(path, from: x0, to: x1, y: y0, dir: topDir,
                                  cellW: cellW, tabSize: tabSize, reversed: false)
                addVerticalEdge(path, from: y0, to: y1, x: x1, dir: rightDir,
                                cellH: cellH, tabSize: tabSize, reversed: false)
                addHorizontalEdge(path, from: x1, to: x0, y: y1, dir: bottomDir,
                                  cellW: cellW, tabSize: tabSize, reversed: true)
                addVerticalEdge(path, from: y1, to: y0, x: x0, dir: leftDir,
                                cellH: cellH, tabSize: tabSize, reversed: true)
                path.closeSubpath()

                var neighbors: [Int] = []
                if r > 0 { neighbors.append((r - 1) * cols + c) }
                if r < rows - 1 { neighbors.append((r + 1) * cols + c) }
                if c > 0 { neighbors.append(r * cols + c - 1) }
                if c < cols - 1 { neighbors.append(r * cols + c + 1) }

                pieces.append(PieceDefinition(
                    id: id,
                    row: r,
                    col: c,
                    path: path.copy() ?? path,
                    bounds: CGRect(x: x0 - tabSize, y: y0 - tabSize,
                                   width: cellW + 2 * tabSize, height: cellH + 2 * tabSize),
                    centroid: CGPoint(x: (x0 + x1) / 2, y: (y0 + y1) / 2),
                    neighbors: neighbors
                ))
            }
        }

        return PuzzleLayout(imageSize: imageSize, rows: rows, cols: cols, edges: edges, pieces: pieces)
    }

    /// Horizontal edge from `xa` to `xb` at fixed `y`.
    /// Top edge (not reversed): dir > 0 means the tab protrudes up.
    /// Bottom edge (reversed, right-to-left): dir > 0 means the tab protrudes down.
    private static func addHorizontalEdge(
        _ path: CGMutablePath,
        from xa: CGFloat, to xb: CGFloat, y: CGFloat,
        dir: CGFloat, cellW: CGFloat, tabSize: CGFloat, reversed: Bool
    ) {
        guard dir != 0 else {
            path.addLine(to: CGPoint(x: xb, y: y))
            return
        }
        let mx = (xa + xb) / 2
        let e = cellW * 0.2   // shoulder width from the cell corner
        let r = cellW * 0.15  // half-width of the rounded tip
        let hy = (reversed ? 1 : -1) * tabSize * dir

        if xa < xb {
            path.addLine(to: CGPoint(x: xa + e, y: y))
            path.addCurve(to: CGPoint(x: mx, y: y + hy),
                          control1: CGPoint(x: xa + e, y: y + hy * 0.5),
                          control2: CGPoint(x: mx - r, y: y + hy))
            path.addCurve(to: CGPoint(x: xb - e, y: y),
                          control1: CGPoint(x: mx + r, y: y + hy),
                          control2: CGPoint(x: xb - e, y: y + hy * 0.5))
        } else {
            path.addLine(to: CGPoint(x: xa - e, y: y))
            path.addCurve(to: CGPoint(x: mx, y: y + hy),
                          control1: CGPoint(x: xa - e, y: y + hy * 0.5),
                          control2: CGPoint(x: mx + r, y: y + hy))
            path.addCurve(to: CGPoint(x: xb + e, y: y),
                          control1: CGPoint(x: mx - r, y: y + hy),
                          control2: CGPoint(x: xb + e, y: y + hy * 0.5))
        }
        path.addLine(to: CGPoint(x: xb, y: y))
    }

    /// Vertical edge from `ya` to `yb` at fixed `x`.
    /// Right edge (not reversed): dir > 0 means the tab protrudes right.
    /// Left edge (reversed, bottom-to-top): dir > 0 means the tab protrudes left.
    private static func addVerticalEdge(
        _ path: CGMutablePath,
        from ya: CGFloat, to yb: CGFloat, x: CGFloat,
        dir: CGFloat, cellH: CGFloat, tabSize: CGFloat, reversed: Bool
    ) {
        guard dir != 0 else {
            path.addLine(to: CGPoint(x: x, y: yb))
            return
        }
        let my = (ya + yb) / 2
        let e = cellH * 0.2
        let r = cellH * 0.15
        let hx = (reversed ? -1 : 1) * tabSize * dir

        if ya < yb {
            path.addLine(to: CGPoint(x: x, y: ya + e))
            path.addCurve(to: CGPoint(x: x + hx, y: my),
                          control1: CGPoint(x: x + hx * 0.5, y: ya + e),
                          control2: CGPoint(x: x + hx, y: my - r))
            path.addCurve(to: CGPoint(x: x, y: yb - e),
                          control1: CGPoint(x: x + hx, y: my + r),
                          control2: CGPoint(x: x + hx * 0.5, y: yb - e))
        } else {
            path.addLine(to: CGPoint(x: x, y: ya - e))
            path.addCurve(to: CGPoint(x: x + hx, y: my),
                          control1: CGPoint(x: x + hx * 0.5, y: ya - e),
                          control2: CGPoint(x: x + hx, y: my + r))
            path.addCurve(to: CGPoint(x: x, y: yb + e),
                          control1: CGPoint(x: x + hx, y: my - r),
                          control2: CGPoint(x: x + hx * 0.5, y: yb + e))
        }
        path.addLine(to: CGPoint(x: x, y: yb))
    }
}
