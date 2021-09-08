import { Path } from './Path';
import * as MathUtils from '@/math/MathUtils';

class Shape extends Path {
	public uuid: any;
	holes: any[];

	constructor( points ) {

		super( points );

		this.uuid = MathUtils.generateUUID();

		this.type = 'Shape';

		this.holes = [];

	}

	getPointsHoles( divisions ) {

		const holesPts = [];

		for ( let i = 0, l = this.holes.length; i < l; i ++ ) {

			holesPts[ i ] = this.holes[ i ].getPoints( divisions );

		}

		return holesPts;

	}

	// get points of shape and holes (keypoints based on segments parameter)

	extractPoints( divisions ) {

		return {

			shape: this.getPoints( divisions ),
			holes: this.getPointsHoles( divisions )

		};

	}
}


export { Shape };
