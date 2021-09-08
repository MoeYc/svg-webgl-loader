import { Curve } from '@/curves/Curve';

export class CurvePath extends Curve {
  curves: any[];
  autoClose: boolean;
  cacheLengths = [];

  constructor() {
    super();

    this.type = 'CurvePath';

    this.curves = [];
    this.autoClose = false; // Automatically closes the path
  }

  add(curve) {
    this.curves.push(curve);
  }

  getPoint(t) {
    const d = t * this.getLength();
    const curveLengths = this.getCurveLengths();
    let i = 0;

    // To think about boundaries points.

    while (i < curveLengths.length) {
      if (curveLengths[i] >= d) {
        const diff = curveLengths[i] - d;
        const curve = this.curves[i];

        const segmentLength = curve.getLength();
        const u = segmentLength === 0 ? 0 : 1 - diff / segmentLength;

        return curve.getPointAt(u);
      }

      i++;
    }

    return null;

    // loop where sum != 0, sum > d , sum+1 <d
  }

  // We cannot use the default THREE.Curve getPoint() with getLength() because in
  // THREE.Curve, getLength() depends on getPoint() but in THREE.CurvePath
  // getPoint() depends on getLength

  getLength() {
    const lens = this.getCurveLengths();
    return lens[lens.length - 1];
  }

  // cacheLengths must be recalculated.
  updateArcLengths() {
    this.needsUpdate = true;
    this.cacheLengths = null;
    this.getCurveLengths();
  }

  // Compute lengths and cache them
  // We cannot overwrite getLengths() because UtoT mapping uses it.

  getCurveLengths() {
    // We use cache values if curves and cache array are same length

    if (this.cacheLengths && this.cacheLengths.length === this.curves.length) {
      return this.cacheLengths;
    }

    // Get length of sub-curve
    // Push sums into cached array

    const lengths = [];
    let sums = 0;

    for (let i = 0, l = this.curves.length; i < l; i++) {
      sums += this.curves[i].getLength();
      lengths.push(sums);
    }

    this.cacheLengths = lengths;

    return lengths;
  }

  getSpacedPoints(divisions = 40) {
    const points = [];

    for (let i = 0; i <= divisions; i++) {
      points.push(this.getPoint(i / divisions));
    }

    if (this.autoClose) {
      points.push(points[0]);
    }

    return points;
  }

  getPoints(divisions = 12) {
    const points = [];
    let last;

    for (let i = 0, curves = this.curves; i < curves.length; i++) {
      const curve = curves[i];
      const resolution =
        curve && curve.isEllipseCurve
          ? divisions * 2
          : curve && (curve.isLineCurve || curve.isLineCurve3)
          ? 1
          : curve && curve.isSplineCurve
          ? divisions * curve.points.length
          : divisions;

      const pts = curve.getPoints(resolution);

      for (let j = 0; j < pts.length; j++) {
        const point = pts[j];

        if (last && last.equals(point)) continue; // ensures no consecutive points are duplicates

        points.push(point);
        last = point;
      }
    }

    if (
      this.autoClose &&
      points.length > 1 &&
      !points[points.length - 1].equals(points[0])
    ) {
      points.push(points[0]);
    }

    return points;
  }
}
