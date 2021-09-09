import { Vector2 } from '@/math/Vector2';
import { CurvePath } from '@/curves/CurvePath';
import { LineCurve } from '@/curves/LineCurve';
import { CubicBezierCurve } from '@/curves/CubicBezierCurve';
import { QuadraticBezierCurve } from '@/curves/QuadraticBezierCurve';
import { EllipseCurve } from '@/curves/EllipseCurve';

export class Path extends CurvePath {
  type;
  currentPoint;
  curves = [];

  constructor(points?) {
    super();
    this.type = 'Path';

    this.currentPoint = new Vector2();

    if (points) {
      this.setFromPoints(points);
    }
  }

  setFromPoints(points) {
    this.moveTo(points[0].x, points[0].y);
    for (let i = 1, l = points.length; i < l; i++) {
      this.lineTo(points[i].x, points[i].y);
    }
    return this;
  }

  moveTo(x, y) {
    this.currentPoint.set(x, y);
  }

  lineTo(x, y) {
    this.curves.push(
      new LineCurve(
        new Vector2(this.currentPoint.x, this.currentPoint.y),
        new Vector2(x, y)
      )
    );
    this.currentPoint.set(x, y);
  }

  bezierCurveTo(aCP1x, aCP1y, aCP2x, aCP2y, aX, aY) {
    const curve = new CubicBezierCurve(
      new Vector2(this.currentPoint.x, this.currentPoint.y),
      new Vector2(aCP1x, aCP1y),
      new Vector2(aCP2x, aCP2y),
      new Vector2(aX, aY)
    );
    this.curves.push(curve);
    this.currentPoint.set(aX, aY);
    return this;
  }
  absarc(aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise?: boolean) {
    this.absellipse(
      aX,
      aY,
      aRadius,
      aRadius,
      aStartAngle,
      aEndAngle,
      aClockwise
    );

    return this;
  }
  absellipse(
    aX,
    aY,
    xRadius,
    yRadius,
    aStartAngle,
    aEndAngle,
    aClockwise?: boolean,
    aRotation?: number
  ) {
    const curve = new EllipseCurve(
      aX,
      aY,
      xRadius,
      yRadius,
      aStartAngle,
      aEndAngle,
      aClockwise,
      aRotation
    );

    if (this.curves.length > 0) {
      // if a previous curve is present, attempt to join
      const firstPoint = curve.getPoint(0);

      if (!firstPoint.equals(this.currentPoint)) {
        this.lineTo(firstPoint.x, firstPoint.y);
      }
    }

    this.curves.push(curve);

    const lastPoint = curve.getPoint(1);
    this.currentPoint.copy(lastPoint);

    return this;
  }

  quadraticCurveTo(aCPx, aCPy, aX, aY) {
    const curve = new QuadraticBezierCurve(
      this.currentPoint.clone(),
      new Vector2(aCPx, aCPy),
      new Vector2(aX, aY)
    );

    this.curves.push(curve);

    this.currentPoint.set(aX, aY);

    return this;
  }
}
