// http://www.w3.org/TR/SVG11/implnote.html#PathElementImplementationNotes
export function getReflection( a: number, b: number ) {
	return a - ( b - a );
}

/**
 * https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
 * https://mortoray.com/2017/02/16/rendering-an-svg-elliptical-arc-as-bezier-curves/ Appendix: Endpoint to center arc conversion
 * From
 * rx ry x-axis-rotation large-arc-flag sweep-flag x y
 * To
 * aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation
 */
export function parseArcCommand( path, rx, ry, x_axis_rotation, large_arc_flag, sweep_flag, start, end ) {

	if ( rx == 0 || ry == 0 ) {

		// draw a line if either of the radii == 0
		path.lineTo( end.x, end.y );
		return;

	}

	x_axis_rotation = x_axis_rotation * Math.PI / 180;

	// Ensure radii are positive
	rx = Math.abs( rx );
	ry = Math.abs( ry );

	// Compute (x1', y1')
	const dx2 = ( start.x - end.x ) / 2.0;
	const dy2 = ( start.y - end.y ) / 2.0;
	const x1p = Math.cos( x_axis_rotation ) * dx2 + Math.sin( x_axis_rotation ) * dy2;
	const y1p = - Math.sin( x_axis_rotation ) * dx2 + Math.cos( x_axis_rotation ) * dy2;

	// Compute (cx', cy')
	let rxs = rx * rx;
	let rys = ry * ry;
	const x1ps = x1p * x1p;
	const y1ps = y1p * y1p;

	// Ensure radii are large enough
	const cr = x1ps / rxs + y1ps / rys;

	if ( cr > 1 ) {

		// scale up rx,ry equally so cr == 1
		const s = Math.sqrt( cr );
		rx = s * rx;
		ry = s * ry;
		rxs = rx * rx;
		rys = ry * ry;

	}

	const dq = ( rxs * y1ps + rys * x1ps );
	const pq = ( rxs * rys - dq ) / dq;
	let q = Math.sqrt( Math.max( 0, pq ) );
	if ( large_arc_flag === sweep_flag ) q = - q;
	const cxp = q * rx * y1p / ry;
	const cyp = - q * ry * x1p / rx;

	// Step 3: Compute (cx, cy) from (cx', cy')
	const cx = Math.cos( x_axis_rotation ) * cxp - Math.sin( x_axis_rotation ) * cyp + ( start.x + end.x ) / 2;
	const cy = Math.sin( x_axis_rotation ) * cxp + Math.cos( x_axis_rotation ) * cyp + ( start.y + end.y ) / 2;

	// Step 4: Compute θ1 and Δθ
	const theta = svgAngle( 1, 0, ( x1p - cxp ) / rx, ( y1p - cyp ) / ry );
	const delta = svgAngle( ( x1p - cxp ) / rx, ( y1p - cyp ) / ry, ( - x1p - cxp ) / rx, ( - y1p - cyp ) / ry ) % ( Math.PI * 2 );

	path.currentPath.absellipse( cx, cy, rx, ry, theta, theta + delta, sweep_flag === 0, x_axis_rotation );

}

export function svgAngle( ux, uy, vx, vy ) {

	const dot = ux * vx + uy * vy;
	const len = Math.sqrt( ux * ux + uy * uy ) * Math.sqrt( vx * vx + vy * vy );
	let ang = Math.acos( Math.max( - 1, Math.min( 1, dot / len ) ) ); // floating point precision, slightly over values appear
	if ( ( ux * vy - uy * vx ) < 0 ) ang = - ang;
	return ang;

}
