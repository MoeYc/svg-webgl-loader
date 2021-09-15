import { ShapePath } from '@/paths/ShapePath';
import { Vector2 } from '@/math/Vector2';
import { Matrix3 } from '@/math/Matrix3';
import { Vector3 } from '@/math/Vector3';
import { Scope, Style } from '@/types/types';

// 缓存对象（工具人
const tempV2 = new Vector2();
const tempV3 = new Vector3();
const tempTransform0 = new Matrix3();
const tempTransform1 = new Matrix3();
const tempTransform2 = new Matrix3();
const tempTransform3 = new Matrix3();

export const DEFAULT_SCOPE: Scope = {
	defaultUnit: 'px',
	defaultDPI: 90,
}

export const POINTS_REGEX = /(-?[\d\.?]+)[,|\s](-?[\d\.?]+)/g;

export const UNIT_CONVERSION = {
	mm: {
		mm: 1,
		cm: 0.1,
		in: 1 / 25.4,
		pt: 72 / 25.4,
		pc: 6 / 25.4,
		px: -1,
	},
	cm: {
		mm: 10,
		cm: 1,
		in: 1 / 2.54,
		pt: 72 / 2.54,
		pc: 6 / 2.54,
		px: -1,
	},
	in: {
		mm: 25.4,
		cm: 2.54,
		in: 1,
		pt: 72,
		pc: 6,
		px: -1,
	},
	pt: {
		mm: 25.4 / 72,
		cm: 2.54 / 72,
		in: 1 / 72,
		pt: 1,
		pc: 6 / 72,
		px: -1,
	},
	pc: {
		mm: 25.4 / 6,
		cm: 2.54 / 6,
		in: 1 / 6,
		pt: 72 / 6,
		pc: 1,
		px: -1,
	},
	px: {
		px: 1,
	},
};

export const UNITS = ['mm', 'cm', 'in', 'pt', 'pc', 'px'];

export function parseFloatWithUnits(str: string | number, scope: Scope = DEFAULT_SCOPE) {
	let theUnit = 'px';

	// @ts-ignore
	if (typeof str === 'string' || str instanceof String) {
		for (let i = 0, n = UNITS.length; i < n; i++) {
			const u = UNITS[i];

			if (str.endsWith(u)) {
				theUnit = u;
				str = str.substring(0, str.length - u.length);
				break;
			}
		}
	}

	let scale;
	if (theUnit === 'px' && scope.defaultUnit !== 'px') {
		// Conversion scale from  pixels to inches, then to default units

		scale = UNIT_CONVERSION['in'][scope.defaultUnit] / scope.defaultDPI;
	} else {
		scale = UNIT_CONVERSION[theUnit][scope.defaultUnit];

		if (scale < 0) {
			// Conversion scale to pixels

			scale = UNIT_CONVERSION[theUnit]['in'] * scope.defaultDPI;
		}
	}

	return typeof str === 'number' ? scale * str : scale * parseFloat(str);
}

export function iteratorPoints(path: ShapePath, node: HTMLElement) {
	let index = 0;

	const iterator = (match: string, a: string, b: string): string => {
		const x = parseFloatWithUnits(a);
		const y = parseFloatWithUnits(b);

		if (index === 0) {
			path.moveTo(x, y);
		} else {
			path.lineTo(x, y);
		}

		index++;
		return undefined;
	}

	node.getAttribute('points').replace(POINTS_REGEX, iterator);
}

export function parseFloats(input: string, flags?: number[], stride?: number) {
	if (typeof input !== 'string') {
		throw new TypeError('Invalid input: ' + typeof input);
	}

	// Character groups
	const RE = {
		SEPARATOR: /[ \t\r\n\,.\-+]/,
		WHITESPACE: /[ \t\r\n]/,
		DIGIT: /[\d]/,
		SIGN: /[-+]/,
		POINT: /\./,
		COMMA: /,/,
		EXP: /e/i,
		FLAGS: /[01]/,
	};

	// States
	const SEP = 0;
	const INT = 1;
	const FLOAT = 2;
	const EXP = 3;

	let state = SEP;
	let seenComma = true;
	let number = '',
		exponent = '';
	const result = [];

	function throwSyntaxError(current, i, partial) {
		const error = new SyntaxError(
			'Unexpected character "' + current + '" at index ' + i + '.'
		);
		// @ts-ignore
		error.partial = partial;
		throw error;
	}

	function newNumber() {
		if (number !== '') {
			if (exponent === '') result.push(Number(number));
			else result.push(Number(number) * Math.pow(10, Number(exponent)));
		}

		number = '';
		exponent = '';
	}

	let current;
	const length = input.length;

	for (let i = 0; i < length; i++) {
		current = input[i];

		// check for flags
		if (
			Array.isArray(flags) &&
			flags.includes(result.length % stride) &&
			RE.FLAGS.test(current)
		) {
			state = INT;
			number = current;
			newNumber();
			continue;
		}

		// parse until next number
		if (state === SEP) {
			// eat whitespace
			if (RE.WHITESPACE.test(current)) {
				continue;
			}

			// start new number
			if (RE.DIGIT.test(current) || RE.SIGN.test(current)) {
				state = INT;
				number = current;
				continue;
			}

			if (RE.POINT.test(current)) {
				state = FLOAT;
				number = current;
				continue;
			}

			// throw on double commas (e.g. "1, , 2")
			if (RE.COMMA.test(current)) {
				if (seenComma) {
					throwSyntaxError(current, i, result);
				}

				seenComma = true;
			}
		}

		// parse integer part
		if (state === INT) {
			if (RE.DIGIT.test(current)) {
				number += current;
				continue;
			}

			if (RE.POINT.test(current)) {
				number += current;
				state = FLOAT;
				continue;
			}

			if (RE.EXP.test(current)) {
				state = EXP;
				continue;
			}

			// throw on double signs ("-+1"), but not on sign as separator ("-1-2")
			if (
				RE.SIGN.test(current) &&
				number.length === 1 &&
				RE.SIGN.test(number[0])
			) {
				throwSyntaxError(current, i, result);
			}
		}

		// parse decimal part
		if (state === FLOAT) {
			if (RE.DIGIT.test(current)) {
				number += current;
				continue;
			}

			if (RE.EXP.test(current)) {
				state = EXP;
				continue;
			}

			// throw on double decimal points (e.g. "1..2")
			if (RE.POINT.test(current) && number[number.length - 1] === '.') {
				throwSyntaxError(current, i, result);
			}
		}

		// parse exponent part
		if (state === EXP) {
			if (RE.DIGIT.test(current)) {
				exponent += current;
				continue;
			}

			if (RE.SIGN.test(current)) {
				if (exponent === '') {
					exponent += current;
					continue;
				}

				if (exponent.length === 1 && RE.SIGN.test(exponent)) {
					throwSyntaxError(current, i, result);
				}
			}
		}

		// end of number
		if (RE.WHITESPACE.test(current)) {
			newNumber();
			state = SEP;
			seenComma = false;
		} else if (RE.COMMA.test(current)) {
			newNumber();
			state = SEP;
			seenComma = true;
		} else if (RE.SIGN.test(current)) {
			newNumber();
			state = INT;
			number = current;
		} else if (RE.POINT.test(current)) {
			newNumber();
			state = FLOAT;
			number = current;
		} else {
			throwSyntaxError(current, i, result);
		}
	}

	// add the last number found (if any)
	newNumber();

	return result;
}

export function transformPath(path: ShapePath, m: Matrix3) {
	const transVec2 = (v2: Vector2) => {
		tempV3.set(v2.x, v2.y, 1).applyMatrix3(m);
		v2.set(tempV3.x, tempV3.y);
	}

	const isRotated = isTransformRotated(m);

	const subPaths = path.subPaths;

	for (let i = 0, n = subPaths.length; i < n; i++) {
		const subPath = subPaths[i];
		const curves = subPath.curves;

		for (let j = 0; j < curves.length; j++) {
			const curve = curves[j];

			if (curve.isLineCurve) {
				transVec2(curve.v1);
				transVec2(curve.v2);
			} else if (curve.isCubicBezierCurve) {
				transVec2(curve.v0);
				transVec2(curve.v1);
				transVec2(curve.v2);
				transVec2(curve.v3);
			} else if (curve.isQuadraticBezierCurve) {
				transVec2(curve.v0);
				transVec2(curve.v1);
				transVec2(curve.v2);
			} else if (curve.isEllipseCurve) {
				if (isRotated) {
					console.warn(
						'SVGLoader: Elliptic arc or ellipse rotation or skewing is not implemented.'
					);
				}

				tempV2.set(curve.aX, curve.aY);
				transVec2(tempV2);
				curve.aX = tempV2.x;
				curve.aY = tempV2.y;

				curve.xRadius *= getTransformScaleX(m);
				curve.yRadius *= getTransformScaleY(m);
			}
		}
	}
}

function isTransformRotated(m) {
	return m.elements[1] !== 0 || m.elements[3] !== 0;
}

function getTransformScaleX(m) {
	const te = m.elements;
	return Math.sqrt(te[0] * te[0] + te[1] * te[1]);
}

function getTransformScaleY(m) {
	const te = m.elements;
	return Math.sqrt(te[3] * te[3] + te[4] * te[4]);
}

export function parseCSSStylesheet(node, stylesheets: {[key: string]: any}): {[key: string]: any} {
	if (!node.sheet || !node.sheet.cssRules || !node.sheet.cssRules.length) {
		return;
	}

	for (let i = 0; i < node.sheet.cssRules.length; i++) {
		const stylesheet = node.sheet.cssRules[i];
		if (stylesheet.type !== 1) continue;

		const selectorList = stylesheet.selectorText
		.split(/,/gm)
		.filter(Boolean)
		.map((i) => i.trim());

		for (let j = 0; j < selectorList.length; j++) {
			stylesheets[selectorList[j]] = Object.assign(
				stylesheets[selectorList[j]] || {},
				stylesheet.style
			);
		}
	}
	return stylesheets;
}

export function parseStyle(
	node: HTMLElement, style: Style,
	stylesheets: {[key: string]: any},
	scope: Scope = DEFAULT_SCOPE
) {
	style = Object.assign({}, style); // clone style

	let stylesheetStyles = {};

	if (node.hasAttribute('class')) {
		const classSelectors = node
		.getAttribute('class')
		.split(/\s/)
		.filter(Boolean)
		.map((i) => i.trim());

		for (let i = 0; i < classSelectors.length; i++) {
			stylesheetStyles = Object.assign(
				stylesheetStyles,
				stylesheets['.' + classSelectors[i]]
			);
		}
	}

	if (node.hasAttribute('id')) {
		stylesheetStyles = Object.assign(
			stylesheetStyles,
			stylesheets['#' + node.getAttribute('id')]
		);
	}

	function addStyle(svgName, jsName, adjustFunction?) {
		if (adjustFunction === undefined)
			adjustFunction = function copy(v) {
				if (v.startsWith('url'))
					console.warn(
						'SVGLoader: url access in attributes is not implemented.'
					);

				return v;
			};

		if (node.hasAttribute(svgName)) {
			style[jsName] = adjustFunction(node.getAttribute(svgName));
		}
		if (stylesheetStyles[svgName]) {
			style[jsName] = adjustFunction(stylesheetStyles[svgName]);
		}
		if (node.style && node.style[svgName] !== '') {
			style[jsName] = adjustFunction(node.style[svgName]);
		}
	}

	function clamp(v) {
		return Math.max(0, Math.min(1, parseFloatWithUnits(v, scope)));
	}

	function positive(v) {
		return Math.max(0, parseFloatWithUnits(v, scope));
	}

	addStyle('fill', 'fill');
	addStyle('fill-opacity', 'fillOpacity', clamp);
	addStyle('opacity', 'opacity', clamp);
	addStyle('stroke', 'stroke');
	addStyle('stroke-opacity', 'strokeOpacity', clamp);
	addStyle('stroke-width', 'strokeWidth', positive);
	addStyle('stroke-linejoin', 'strokeLineJoin');
	addStyle('stroke-linecap', 'strokeLineCap');
	addStyle('stroke-miterlimit', 'strokeMiterLimit', positive);
	addStyle('visibility', 'visibility');

	return style;
}

function parseNodeTransform(node: HTMLElement, scope: Scope = DEFAULT_SCOPE) {
	const transform = new Matrix3();
	const currentTransform = tempTransform0;

	if (
		node.nodeName === 'use' &&
		(node.hasAttribute('x') || node.hasAttribute('y'))
	) {
		const tx = parseFloatWithUnits(node.getAttribute('x'), scope);
		const ty = parseFloatWithUnits(node.getAttribute('y'), scope);

		transform.translate(tx, ty);
	}

	if (node.hasAttribute('transform')) {
		const transformsTexts = node.getAttribute('transform').split(')');

		for (let tIndex = transformsTexts.length - 1; tIndex >= 0; tIndex--) {
			const transformText = transformsTexts[tIndex].trim();

			if (transformText === '') continue;

			const openParPos = transformText.indexOf('(');
			const closeParPos = transformText.length;

			if (openParPos > 0 && openParPos < closeParPos) {
				const transformType = transformText.substr(0, openParPos);

				const array = parseFloats(
					transformText.substr(openParPos + 1, closeParPos - openParPos - 1)
				);

				currentTransform.identity();

				switch (transformType) {
					case 'translate':
						if (array.length >= 1) {
							const tx = array[0];
							let ty = tx;

							if (array.length >= 2) {
								ty = array[1];
							}

							currentTransform.translate(tx, ty);
						}

						break;

					case 'rotate':
						if (array.length >= 1) {
							let angle = 0;
							let cx = 0;
							let cy = 0;

							// Angle
							angle = (-array[0] * Math.PI) / 180;

							if (array.length >= 3) {
								// Center x, y
								cx = array[1];
								cy = array[2];
							}

							// Rotate around center (cx, cy)
							tempTransform1.identity().translate(-cx, -cy);
							tempTransform2.identity().rotate(angle);
							tempTransform3.multiplyMatrices(tempTransform2, tempTransform1);
							tempTransform1.identity().translate(cx, cy);
							currentTransform.multiplyMatrices(
								tempTransform1,
								tempTransform3
							);
						}

						break;

					case 'scale':
						if (array.length >= 1) {
							const scaleX = array[0];
							let scaleY = scaleX;

							if (array.length >= 2) {
								scaleY = array[1];
							}

							currentTransform.scale(scaleX, scaleY);
						}

						break;

					case 'skewX':
						if (array.length === 1) {
							currentTransform.set(
								1, Math.tan((array[0] * Math.PI) / 180), 0,
								0, 1, 0,
								0, 0, 1
							);
						}

						break;

					case 'skewY':
						if (array.length === 1) {
							currentTransform.set(
								1, 0, 0,
								Math.tan((array[0] * Math.PI) / 180), 1, 0,
								0, 0, 1
							);
						}

						break;

					case 'matrix':
						if (array.length === 6) {
							currentTransform.set(
								array[0], array[2], array[4],
								array[1], array[3], array[5],
								0, 0, 1
							);
						}

						break;
				}
			}

			transform.premultiply(currentTransform);
		}
	}

	return transform;
}

export function getNodeTransform(
	node: HTMLElement,
	currentTransform: Matrix3,
	transformStack: Matrix3[],
	scope: Scope = DEFAULT_SCOPE
) {
	if (
		!(
			node.hasAttribute('transform') ||
			(node.nodeName === 'use' &&
				(node.hasAttribute('x') || node.hasAttribute('y')))
		)
	) {
		return null;
	}

	const transform = parseNodeTransform(node, scope);

	if (transformStack.length > 0) {
		transform.premultiply(transformStack[transformStack.length - 1]);
	}

	currentTransform.copy(transform);
	transformStack.push(transform);

	return transform;
}
