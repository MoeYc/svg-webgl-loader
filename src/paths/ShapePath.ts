import { Path } from './Path';
import { Color } from '@/math/Color';

export class ShapePath {
	type = ShapePath;
	color = new Color();
	subPaths = [];
	currentPath = null;
	userData = null;

	moveTo( x, y ) {
		this.currentPath = new Path();
		this.subPaths.push( this.currentPath );
		this.currentPath.moveTo( x, y );
		return this;
	}

	lineTo( x, y ) {
		this.currentPath.lineTo( x, y );
		return this;
	}

	bezierCurveTo( aCP1x, aCP1y, aCP2x, aCP2y, aX, aY ) {
		this.currentPath.bezierCurveTo( aCP1x, aCP1y, aCP2x, aCP2y, aX, aY );
		return this;
	}

	quadraticCurveTo( aCPx, aCPy, aX, aY ) {
		this.currentPath.quadraticCurveTo( aCPx, aCPy, aX, aY );
		return this;
	}
}
