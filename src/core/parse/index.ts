import { Matrix3 } from '@/math/Matrix3';
import {
	DEFAULT_SCOPE, getNodeTransform,
	parseCSSStylesheet,
	parseStyle,
	transformPath,
} from '@/core/parse/parseUtil';
import {
	parseCircleNode,
	parseEllipseNode,
	parseLineNode,
	parsePathNode,
	parsePolyNode,
	parseRectNode
} from '@/core/parse/parseNode';
import { ShapePath } from '@/paths/ShapePath';
import { Scope, Style, ViewBox } from '@/types/types';

export const parse = (text: string, scope: Scope = DEFAULT_SCOPE) => {
	const paths = [];
	const stylesheets = {};
	const transformStack = [];
	const currentTransform = new Matrix3();
	let viewBox: ViewBox;

	const parseNode = (node, style: Style) => {
		if (node.nodeType !== 1) return;

		const transform = getNodeTransform(node, currentTransform, transformStack, scope);

		let traverseChildNodes = true;
		let path: ShapePath = null;
		switch (node.nodeName) {
			case 'svg':
				viewBox = node.viewBox.baseVal as ViewBox;
				break;
			case 'style':
				parseCSSStylesheet(node, stylesheets);
				break;
			case 'g':
				style = parseStyle(node, style, stylesheets, scope);
				break;
			case 'path':
				style = parseStyle(node, style, stylesheets, scope);
				if (node.hasAttribute('d')) path = parsePathNode(node);
				break;
			case 'rect':
				style = parseStyle(node, style, stylesheets, scope);
				path = parseRectNode(node);
				break;
			case 'polygon':
				style = parseStyle(node, style, stylesheets, scope);
				path = parsePolyNode(node);
				break;
			case 'polyline':
				style = parseStyle(node, style, stylesheets, scope);
				path = parsePolyNode(node);
				break;
			case 'circle':
				style = parseStyle(node, style, stylesheets, scope);
				path = parseCircleNode(node);
				break;
			case 'ellipse':
				style = parseStyle(node, style, stylesheets, scope);
				path = parseEllipseNode(node);
				break;
			case 'line':
				style = parseStyle(node, style, stylesheets, scope);
				path = parseLineNode(node);
				break;
			case 'defs':
				traverseChildNodes = false;
				break;
			case 'use': {
				style = parseStyle(node, style, stylesheets, scope);
				const usedNodeId = (node as SVGUseElement).href.baseVal.substring(1);
				const usedNode = node.viewportElement.getElementById(usedNodeId);
				if (usedNode) {
					parseNode(usedNode, style);
				} else {
					console.warn(
						'SVGLoader: \'use node\' references non-existent node id: ' +
						usedNodeId
					);
				}
				break;
			}
			default:
				console.warn(`Invalid Node: ${ node.nodeName }`);
		}

		if (path) {
			if (style.fill !== undefined && style.fill !== 'none') {
				path.color.setStyle(style.fill);
			}

			transformPath(path, currentTransform);

			paths.push(path);

			path.userData = { node: node, style: style };
		}

		if (traverseChildNodes) {
			const nodes = node.childNodes;

			for (let i = 0; i < nodes.length; i++) {
				parseNode(nodes[i], style);
			}
		}

		if (transform) {
			transformStack.pop();

			if (transformStack.length > 0) {
				currentTransform.copy(transformStack[transformStack.length - 1]);
			} else {
				currentTransform.identity();
			}
		}
	}

	const xml = new DOMParser().parseFromString(text, 'image/svg+xml'); // application/xml

	parseNode(xml.documentElement, {
		fill: '#000',
		fillOpacity: 1,
		strokeOpacity: 1,
		strokeWidth: 1,
		strokeLineJoin: 'miter',
		strokeLineCap: 'butt',
		strokeMiterLimit: 4,
	});

	return {
		paths,
		viewBox
	};
};
