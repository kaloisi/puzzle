import UIKit

/// A pre-rendered bitmap of a piece or group, clipped to its jigsaw outline.
struct EntitySprite {
    let image: UIImage
    /// Size of the sprite in board points (before zoom).
    let size: CGSize
    /// Location of the entity's centroid inside the sprite, in board points.
    let anchor: CGPoint
}

/// Renders piece/group sprites from the puzzle image.
///
/// Each entity is drawn once into a bitmap and then displayed as a plain image,
/// so moving and rotating hundreds of pieces is cheap.
final class SpriteRenderer: @unchecked Sendable {
    /// Extra margin around a sprite, in image pixels.
    static let padding: CGFloat = 4

    let layout: PuzzleLayout
    /// Board points per image pixel.
    let scale: CGFloat
    /// Bitmap pixels per board point.
    let pixelScale: CGFloat

    /// The source image, downscaled to the largest size a sprite will ever need.
    private let source: UIImage

    init(image: UIImage, layout: PuzzleLayout, scale: CGFloat, pixelScale: CGFloat) {
        self.layout = layout
        self.scale = scale
        self.pixelScale = pixelScale

        let target = CGSize(width: (layout.imageSize.width * scale * pixelScale).rounded(.up),
                            height: (layout.imageSize.height * scale * pixelScale).rounded(.up))
        if target.width < image.size.width * image.scale, target.width > 0, target.height > 0 {
            let format = UIGraphicsImageRendererFormat()
            format.scale = 1
            format.opaque = true
            source = UIGraphicsImageRenderer(size: target, format: format).image { _ in
                image.draw(in: CGRect(origin: .zero, size: target))
            }
        } else {
            source = image
        }
    }

    func sprite(for entity: PuzzleEntity) -> EntitySprite {
        let pieces = entity.pieceIDs.map { layout.pieces[$0] }
        var box = pieces.first?.bounds ?? .zero
        for piece in pieces.dropFirst() {
            box = box.union(piece.bounds)
        }
        box = box.insetBy(dx: -Self.padding, dy: -Self.padding)

        let size = CGSize(width: box.width * scale, height: box.height * scale)
        let anchor = CGPoint(x: (entity.centroid.x - box.minX) * scale,
                             y: (entity.centroid.y - box.minY) * scale)

        let format = UIGraphicsImageRendererFormat()
        format.scale = pixelScale
        format.opaque = false

        let scale = self.scale
        let imageRect = CGRect(origin: .zero, size: layout.imageSize)
        let source = self.source

        let image = UIGraphicsImageRenderer(size: size, format: format).image { context in
            let cg = context.cgContext
            // Work directly in image-space coordinates.
            cg.scaleBy(x: scale, y: scale)
            cg.translateBy(x: -box.minX, y: -box.minY)

            cg.saveGState()
            for piece in pieces { cg.addPath(piece.path) }
            cg.clip()
            source.draw(in: imageRect)
            cg.restoreGState()

            cg.setStrokeColor(UIColor(white: 1, alpha: 0.4).cgColor)
            cg.setLineWidth(0.5 / scale)
            cg.setLineJoin(.round)
            for piece in pieces { cg.addPath(piece.path) }
            cg.strokePath()
        }

        return EntitySprite(image: image, size: size, anchor: anchor)
    }
}
