import { DEFAULT_SCOPE, iteratorPoints, parseFloats, parseFloatWithUnits } from '@/core/parse/parseUtil';
import { ShapePath } from '@/paths/ShapePath';
import { Path } from '@/paths/Path';
import { Vector2 } from '@/math/Vector2';
import { getReflection, parseArcCommand } from '@/utils/svgUtils';
import { Scope } from '@/types/types';

export function parsePathNode(node: HTMLElement): ShapePath {
	const path = new ShapePath();

	const point = new Vector2();
	const control = new Vector2();

	const firstPoint = new Vector2();
	let isFirstPoint = true;
	let doSetFirstPoint = false;

	const d = node.getAttribute('d');

	// console.log( d );

	const commands = d.match(/[a-df-z][^a-df-z]*/gi);

	for (let i = 0, l = commands.length; i < l; i++) {
		const command = commands[i];

		const type = command.charAt(0);
		const data = command.substr(1).trim();

		if (isFirstPoint === true) {
			doSetFirstPoint = true;
			isFirstPoint = false;
		}

		let numbers;
		switch (type) {
			case 'M':
				numbers = parseFloats(data);
				for (let j = 0, jl = numbers.length; j < jl; j += 2) {
					point.x = numbers[j + 0];
					point.y = numbers[j + 1];
					control.x = point.x;
					control.y = point.y;

					if (j === 0) {
						path.moveTo(point.x, point.y);
					} else {
						path.lineTo(point.x, point.y);
					}

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}
				break;
			case 'H':
				numbers = parseFloats(data);
				for (let j = 0, jl = numbers.length; j < jl; j++) {
					point.x = numbers[j];
					control.x = point.x;
					control.y = point.y;
					path.lineTo(point.x, point.y);

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}
				break;

			case 'V':
				numbers = parseFloats(data);

				for (let j = 0, jl = numbers.length; j < jl; j++) {
					point.y = numbers[j];
					control.x = point.x;
					control.y = point.y;
					path.lineTo(point.x, point.y);

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 'L':
				numbers = parseFloats(data);

				for (let j = 0, jl = numbers.length; j < jl; j += 2) {
					point.x = numbers[j + 0];
					point.y = numbers[j + 1];
					control.x = point.x;
					control.y = point.y;
					path.lineTo(point.x, point.y);

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 'C':
				numbers = parseFloats(data);

				for (let j = 0, jl = numbers.length; j < jl; j += 6) {
					path.bezierCurveTo(
						numbers[j + 0],
						numbers[j + 1],
						numbers[j + 2],
						numbers[j + 3],
						numbers[j + 4],
						numbers[j + 5]
					);
					control.x = numbers[j + 2];
					control.y = numbers[j + 3];
					point.x = numbers[j + 4];
					point.y = numbers[j + 5];

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 'S':
				numbers = parseFloats(data);

				for (let j = 0, jl = numbers.length; j < jl; j += 4) {
					path.bezierCurveTo(
						getReflection(point.x, control.x),
						getReflection(point.y, control.y),
						numbers[j + 0],
						numbers[j + 1],
						numbers[j + 2],
						numbers[j + 3]
					);
					control.x = numbers[j + 0];
					control.y = numbers[j + 1];
					point.x = numbers[j + 2];
					point.y = numbers[j + 3];

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 'Q':
				numbers = parseFloats(data);

				for (let j = 0, jl = numbers.length; j < jl; j += 4) {
					path.quadraticCurveTo(
						numbers[j + 0],
						numbers[j + 1],
						numbers[j + 2],
						numbers[j + 3]
					);
					control.x = numbers[j + 0];
					control.y = numbers[j + 1];
					point.x = numbers[j + 2];
					point.y = numbers[j + 3];

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 'T':
				numbers = parseFloats(data);

				for (let j = 0, jl = numbers.length; j < jl; j += 2) {
					const rx = getReflection(point.x, control.x);
					const ry = getReflection(point.y, control.y);
					path.quadraticCurveTo(rx, ry, numbers[j + 0], numbers[j + 1]);
					control.x = rx;
					control.y = ry;
					point.x = numbers[j + 0];
					point.y = numbers[j + 1];

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 'A':
				numbers = parseFloats(data, [3, 4], 7);

				for (let j = 0, jl = numbers.length; j < jl; j += 7) {
					// skip command if start point == end point
					if (numbers[j + 5] == point.x && numbers[j + 6] == point.y)
						continue;

					const start = point.clone();
					point.x = numbers[j + 5];
					point.y = numbers[j + 6];
					control.x = point.x;
					control.y = point.y;
					parseArcCommand(
						path,
						numbers[j],
						numbers[j + 1],
						numbers[j + 2],
						numbers[j + 3],
						numbers[j + 4],
						start,
						point
					);

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 'm':
				numbers = parseFloats(data);

				for (let j = 0, jl = numbers.length; j < jl; j += 2) {
					point.x += numbers[j + 0];
					point.y += numbers[j + 1];
					control.x = point.x;
					control.y = point.y;

					if (j === 0) {
						path.moveTo(point.x, point.y);
					} else {
						path.lineTo(point.x, point.y);
					}

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 'h':
				numbers = parseFloats(data);

				for (let j = 0, jl = numbers.length; j < jl; j++) {
					point.x += numbers[j];
					control.x = point.x;
					control.y = point.y;
					path.lineTo(point.x, point.y);

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 'v':
				numbers = parseFloats(data);

				for (let j = 0, jl = numbers.length; j < jl; j++) {
					point.y += numbers[j];
					control.x = point.x;
					control.y = point.y;
					path.lineTo(point.x, point.y);

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 'l':
				numbers = parseFloats(data);

				for (let j = 0, jl = numbers.length; j < jl; j += 2) {
					point.x += numbers[j + 0];
					point.y += numbers[j + 1];
					control.x = point.x;
					control.y = point.y;
					path.lineTo(point.x, point.y);

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 'c':
				numbers = parseFloats(data);

				for (let j = 0, jl = numbers.length; j < jl; j += 6) {
					path.bezierCurveTo(
						point.x + numbers[j + 0],
						point.y + numbers[j + 1],
						point.x + numbers[j + 2],
						point.y + numbers[j + 3],
						point.x + numbers[j + 4],
						point.y + numbers[j + 5]
					);
					control.x = point.x + numbers[j + 2];
					control.y = point.y + numbers[j + 3];
					point.x += numbers[j + 4];
					point.y += numbers[j + 5];

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 's':
				numbers = parseFloats(data);

				for (let j = 0, jl = numbers.length; j < jl; j += 4) {
					path.bezierCurveTo(
						getReflection(point.x, control.x),
						getReflection(point.y, control.y),
						point.x + numbers[j + 0],
						point.y + numbers[j + 1],
						point.x + numbers[j + 2],
						point.y + numbers[j + 3]
					);
					control.x = point.x + numbers[j + 0];
					control.y = point.y + numbers[j + 1];
					point.x += numbers[j + 2];
					point.y += numbers[j + 3];

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 'q':
				numbers = parseFloats(data);

				for (let j = 0, jl = numbers.length; j < jl; j += 4) {
					path.quadraticCurveTo(
						point.x + numbers[j + 0],
						point.y + numbers[j + 1],
						point.x + numbers[j + 2],
						point.y + numbers[j + 3]
					);
					control.x = point.x + numbers[j + 0];
					control.y = point.y + numbers[j + 1];
					point.x += numbers[j + 2];
					point.y += numbers[j + 3];

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 't':
				numbers = parseFloats(data);

				for (let j = 0, jl = numbers.length; j < jl; j += 2) {
					const rx = getReflection(point.x, control.x);
					const ry = getReflection(point.y, control.y);
					path.quadraticCurveTo(
						rx,
						ry,
						point.x + numbers[j + 0],
						point.y + numbers[j + 1]
					);
					control.x = rx;
					control.y = ry;
					point.x = point.x + numbers[j + 0];
					point.y = point.y + numbers[j + 1];

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 'a':
				numbers = parseFloats(data, [3, 4], 7);

				for (let j = 0, jl = numbers.length; j < jl; j += 7) {
					// skip command if no displacement
					if (numbers[j + 5] == 0 && numbers[j + 6] == 0) continue;

					const start = point.clone();
					point.x += numbers[j + 5];
					point.y += numbers[j + 6];
					control.x = point.x;
					control.y = point.y;
					parseArcCommand(
						path,
						numbers[j],
						numbers[j + 1],
						numbers[j + 2],
						numbers[j + 3],
						numbers[j + 4],
						start,
						point
					);

					if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
				}

				break;

			case 'Z':
			case 'z':
				path.currentPath.autoClose = true;

				if (path.currentPath.curves.length > 0) {
					// Reset point to beginning of Path
					point.copy(firstPoint);
					path.currentPath.currentPoint.copy(point);
					isFirstPoint = true;
				}

				break;

			default:
				console.warn(command);
		}

		// console.log( type, parseFloats( data ), parseFloats( data ).length  )

		doSetFirstPoint = false;
	}

	return path;
}

export function parseRectNode(node: HTMLElement, scope: Scope = DEFAULT_SCOPE): ShapePath {
	const x = parseFloatWithUnits(node.getAttribute('x') || 0, scope);
	const y = parseFloatWithUnits(node.getAttribute('y') || 0, scope);
	const rx = parseFloatWithUnits(node.getAttribute('rx') || 0, scope);
	const ry = parseFloatWithUnits(node.getAttribute('ry') || 0, scope);
	const w = parseFloatWithUnits(node.getAttribute('width'), scope);
	const h = parseFloatWithUnits(node.getAttribute('height'), scope);

	const path = new ShapePath();
	path.moveTo(x + 2 * rx, y);
	path.lineTo(x + w - 2 * rx, y);

	if (rx !== 0 || ry !== 0) {
		path.bezierCurveTo(x + w, y, x + w, y, x + w, y + 2 * ry);
	}
	path.lineTo(x + w, y + h - 2 * ry);

	if (rx !== 0 || ry !== 0) {
		path.bezierCurveTo(x + w, y + h, x + w, y + h, x + w - 2 * rx, y + h);
	}
	path.lineTo(x + 2 * rx, y + h);

	if (rx !== 0 || ry !== 0) {
		path.bezierCurveTo(x, y + h, x, y + h, x, y + h - 2 * ry);
	}
	path.lineTo(x, y + 2 * ry);

	if (rx !== 0 || ry !== 0) {
		path.bezierCurveTo(x, y, x, y, x + 2 * rx, y);
	}

	return path;
}

export function parsePolyNode(node: HTMLElement): ShapePath {
	const path = new ShapePath();

	iteratorPoints(path, node);

	path.currentPath.autoClose = true;

	return path;
}

export function parseCircleNode(node: HTMLElement, scope: Scope = DEFAULT_SCOPE) {
	const x = parseFloatWithUnits(node.getAttribute('cx') || 0, scope);
	const y = parseFloatWithUnits(node.getAttribute('cy') || 0, scope);
	const r = parseFloatWithUnits(node.getAttribute('r') || 0, scope);

	const subpath = new Path();
	subpath.absarc(x, y, r, 0, Math.PI * 2);

	const path = new ShapePath();
	path.subPaths.push(subpath);

	return path;
}

export function parseEllipseNode(node: HTMLElement, scope: Scope = DEFAULT_SCOPE): ShapePath {
	const x = parseFloatWithUnits(node.getAttribute('cx') || 0, scope);
	const y = parseFloatWithUnits(node.getAttribute('cy') || 0, scope);
	const rx = parseFloatWithUnits(node.getAttribute('rx') || 0, scope);
	const ry = parseFloatWithUnits(node.getAttribute('ry') || 0, scope);

	const subPath = new Path();
	subPath.absellipse(x, y, rx, ry, 0, Math.PI * 2);

	const path = new ShapePath();
	path.subPaths.push(subPath);

	return path;
}

export function parseLineNode(node: HTMLElement, scope: Scope = DEFAULT_SCOPE) {
	const x1 = parseFloatWithUnits(node.getAttribute('x1') || 0, scope);
	const y1 = parseFloatWithUnits(node.getAttribute('y1') || 0, scope);
	const x2 = parseFloatWithUnits(node.getAttribute('x2') || 0, scope);
	const y2 = parseFloatWithUnits(node.getAttribute('y2') || 0, scope);

	const path = new ShapePath();
	path.moveTo(x1, y1);
	path.lineTo(x2, y2);
	path.currentPath.autoClose = false;

	return path;
}
