import CoreGraphics
import Foundation

// MARK: - CGPoint arithmetic

extension CGPoint {
    static func + (lhs: CGPoint, rhs: CGPoint) -> CGPoint {
        CGPoint(x: lhs.x + rhs.x, y: lhs.y + rhs.y)
    }

    static func - (lhs: CGPoint, rhs: CGPoint) -> CGPoint {
        CGPoint(x: lhs.x - rhs.x, y: lhs.y - rhs.y)
    }

    static func * (lhs: CGPoint, rhs: CGFloat) -> CGPoint {
        CGPoint(x: lhs.x * rhs, y: lhs.y * rhs)
    }

    static func / (lhs: CGPoint, rhs: CGFloat) -> CGPoint {
        CGPoint(x: lhs.x / rhs, y: lhs.y / rhs)
    }

    /// Rotate this vector around the origin by `degrees` (clockwise in a y-down space).
    func rotated(byDegrees degrees: Double) -> CGPoint {
        let radians = CGFloat(degrees * .pi / 180)
        let c = cos(radians)
        let s = sin(radians)
        return CGPoint(x: x * c - y * s, y: x * s + y * c)
    }

    func distance(to other: CGPoint) -> CGFloat {
        hypot(x - other.x, y - other.y)
    }
}

// MARK: - Angles

/// Normalize an angle in degrees to the range [0, 360).
func normalizedDegrees(_ degrees: Double) -> Double {
    let r = degrees.truncatingRemainder(dividingBy: 360)
    return r < 0 ? r + 360 : r
}

/// Smallest absolute difference between two angles, in degrees (0...180).
func angularDifference(_ a: Double, _ b: Double) -> Double {
    abs(remainder(a - b, 360))
}

/// Angle of the vector from `center` to `point`, in degrees.
func angleDegrees(from center: CGPoint, to point: CGPoint) -> Double {
    Double(atan2(point.y - center.y, point.x - center.x)) * 180 / .pi
}
