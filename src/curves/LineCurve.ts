import { Curve } from '@/curves/Curve';
import { Vector2 } from '@/math/Vector2';

class LineCurve extends Curve {
	v1
	v2
	isLineCurve: boolean;

	constructor( v1 = new Vector2(), v2 = new Vector2() ) {

		super();

		this.type = 'LineCurve';

		this.v1 = v1;
		this.v2 = v2;

	}

	getPoint( t, optionalTarget = new Vector2() ) {

		const point = optionalTarget;

		if ( t === 1 ) {

			point.copy( this.v2 );

		} else {

			point.copy( this.v2 ).sub( this.v1 );
			point.multiplyScalar( t ).add( this.v1 );

		}

		return point;

	}

	// Line curve is linear, so we can overwrite default getPointAt
	getPointAt( u, optionalTarget ) {
		return this.getPoint( u, optionalTarget );
	}
}

LineCurve.prototype.isLineCurve = true;

export { LineCurve };
