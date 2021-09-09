import { Color } from '@/math/Color';
import { createShapes } from '@/paths/createShapes';
import { ShapeUtils } from '@/utils/ShapeUtils';
import { Vector2 } from '@/math/Vector2';
import { getNormal } from '@/math/MathUtils';
export function parsePathToData(paths, needFill, needStroke) {
	const data = [];
	let boundary = {
		minX: Infinity,
		minY: Infinity,
		maxX: -Infinity,
		maxY: -Infinity,
	}

	paths.forEach((path) => {
    const { fill, fillOpacity } = path.userData.style;
    if (fill && fill !== 'none' && needFill) {
      const color = new Color().setStyle(fill);
      const shapes = createShapes(path);
      shapes.forEach((shape) => {
        const indices = [];
        const vertices = [];

        let groupCount = 0;

        const points = shape.extractPoints(12);
        let shapeVertices = points.shape;
        const shapeHoles = points.holes;

        if (ShapeUtils.isClockWise(shapeVertices) === false) {
          shapeVertices = shapeVertices.reverse();
        }

        for (let i = 0, l = shapeHoles.length; i < l; i++) {
          const shapeHole = shapeHoles[i];
          if (ShapeUtils.isClockWise(shapeHole) === true) {
            shapeHoles[i] = shapeHole.reverse();
          }
        }

        const faces = ShapeUtils.triangulateShape(shapeVertices, shapeHoles);

        for (let i = 0, l = shapeHoles.length; i < l; i++) {
          const shapeHole = shapeHoles[i];
          shapeVertices = shapeVertices.concat(shapeHole);
        }

        // vertices

        for (let i = 0, l = shapeVertices.length; i < l; i++) {
          const vertex = shapeVertices[i];
					boundary = setBoundary(vertex, boundary);
          vertices.push(vertex.x, vertex.y);
        }

        // incides

        for (let i = 0, l = faces.length; i < l; i++) {
          const face = faces[i];
          const a = face[0];
          const b = face[1];
          const c = face[2];

          indices.push(a, b, c);
          groupCount += 3;
				}

				data.push({
					type: "fill",
          indices,
          vertices,
          color,
          fillOpacity,
        });
      });
    }

    const stroke = path.userData.style.stroke;
    if (stroke && stroke !== 'none' && needStroke) {
			const style = path.userData.style;
			const halfLineWidth = style.strokeWidth / 2;
			const { strokeLineCap, strokeLineJoin, strokeOpacity } = style;
			const color = new Color().setStyle(stroke);
			let v: Vector2[] = [];
			const indices = [];
			const vertices = [];
			const pushVertexMap = (...vts: Vector2[]): number[] => {
				const ids = [];
				if (vts && vts.length > 0) {
					let vertex;
					for (let i = 0; i < vts.length; i += 1) {
						vertex = vts[i];
						const idx = vertices.indexOf(vertex);
						if (idx === -1) {
							ids.push(vertices.length / 2);
							vertices.push(vertex.x, vertex.y);
						} else {
							ids.push(idx);
						}
					}
				}
				return ids;
			};
			path.subPaths.forEach((subPath) => {
				v = subPath.getPoints();
				if (v.length < 2) return;


				// 闭合曲线处理
				const isClose = v[0].equals(v[v.length - 1]);
				if (isClose) v.push(v[1].clone());

				const firstNormal: Vector2 = getNormal(v[1], v[0]);
				const firstWidth = firstNormal.clone().multiplyScalar(halfLineWidth);
				const firstPoint = v[0];
				const firstPointL: Vector2 = v[0].clone().sub(firstWidth);
				const firstPointR: Vector2 = v[0].clone().add(firstWidth);
				let prevPoint: Vector2 = v[0];
				let prevPointL: Vector2 = firstPointL;
				let prevPointR: Vector2 = firstPointR;

				let curPoint: Vector2, nextPoint: Vector2, cur0PointL: Vector2, cur0PointR: Vector2,
					cur1PointL: Vector2, cur1PointR: Vector2, next0PointL: Vector2, next0PointR: Vector2,
					curNormal: Vector2, nextNormal: Vector2;
				let innerPoint: Vector2, outerPoint: Vector2;
				let curWidth: Vector2, nextWidth: Vector2;
				for (let i = 1, l = v.length; i < l; i += 1) {
					curPoint = v[i];
					nextPoint = v[i + 1];
					curNormal = getNormal(curPoint, prevPoint);
					curWidth = curNormal.clone().multiplyScalar(halfLineWidth);
					cur0PointL = curPoint.clone().sub(curWidth);
					cur0PointR = curPoint.clone().add(curWidth);
					if (nextPoint) {
						nextNormal = getNormal(nextPoint, curPoint);
						nextWidth = nextNormal.clone().multiplyScalar(halfLineWidth);
						cur1PointL = curPoint.clone().sub(nextWidth);
						cur1PointR = curPoint.clone().add(nextWidth);
						if (!cur0PointL.equals(cur1PointL)) {
							const nextLine = new Vector2().subVectors(nextPoint, curPoint).normalize();
							const dot = Math.abs(curNormal.dot(nextLine));
							const miterSide = halfLineWidth / dot;
							nextLine.setLength(miterSide);
							const prevLine = new Vector2().subVectors(prevPoint, curPoint).setLength(miterSide);
							innerPoint = prevLine.add(nextLine);
							outerPoint = new Vector2(-innerPoint.x, -innerPoint.y).add(curPoint);
							innerPoint = innerPoint.add(curPoint);
							next0PointL = nextPoint.clone().sub(nextWidth);
							next0PointR = nextPoint.clone().add(nextWidth);
							let modify = false;
							// 内点线的右侧，svg以左上角为原点，y轴相反
							if (curNormal.dot(new Vector2().subVectors(nextPoint, prevPoint)) > 0) {
								modify = true;
							}
							// 判断内点有无连接意义
							const l10 = new Vector2().subVectors(prevPoint, curPoint);
							const length10 = l10.length();
							l10.normalize();
							const inner = new Vector2().subVectors(innerPoint, curPoint);
							const l21 = new Vector2().subVectors(nextPoint, curPoint);
							const length21 = l21.length();
							l21.normalize();
							if (Math.abs(l10.dot(inner)) < length10 && Math.abs(l21.dot(inner)) < length21) {
								switch (strokeLineJoin) {
									case 'round':
										if (modify) {
											indices.push(...pushVertexMap(
												prevPointL, prevPointR, innerPoint,
												innerPoint, cur0PointL, prevPointL
											));
											// 计算组成圆角的三角形
											let dot = new Vector2()
											.subVectors(cur0PointL, innerPoint)
											.normalize()
											.dot(
												new Vector2()
												.subVectors(cur1PointL, innerPoint)
												.normalize()
											);
											let angle = Math.PI;
											if (Math.abs(dot) < 1) angle = Math.abs(Math.acos(dot));
											angle /= 12;
											let leftPoint: Vector2 = cur0PointL.clone(),
												rightPoint: Vector2 = cur0PointL.clone();
											for (let i = 0; i < 12; i += 1) {
												rightPoint.rotateAround(innerPoint, angle);
												indices.push(...pushVertexMap(innerPoint, rightPoint, leftPoint));
												leftPoint.copy(rightPoint);
											}
										} else {
											indices.push(...pushVertexMap(
												prevPointL, prevPointR, innerPoint,
												innerPoint, prevPointR, cur0PointR
											));
											// 计算组成圆角的三角形
											let dot = new Vector2()
											.subVectors(cur0PointR, innerPoint)
											.normalize()
											.dot(
												new Vector2()
												.subVectors(cur1PointR, innerPoint)
												.normalize()
											);
											let angle = Math.PI;
											if (Math.abs(dot) < 1) angle = Math.abs(Math.acos(dot));
											angle /= 12;
											let leftPoint: Vector2 = cur1PointR.clone(),
												rightPoint: Vector2 = cur1PointR.clone();
											for (let i = 0; i < 12; i += 1) {
												leftPoint.rotateAround(innerPoint, angle);
												indices.push(...pushVertexMap(innerPoint, leftPoint, rightPoint));
												rightPoint.copy(leftPoint);
											}
										}
										prevPointL = cur1PointL;
										prevPointR = cur1PointR;
										break;
									case 'bevel':
										if (modify) {
											indices.push(...pushVertexMap(
												prevPointL, prevPointR, innerPoint,
												innerPoint, cur0PointL, prevPointL,
												innerPoint, cur1PointL, cur0PointL
											));
										} else {
											indices.push(...pushVertexMap(
												prevPointL, prevPointR, innerPoint,
												innerPoint, prevPointR, cur0PointR,
												innerPoint, cur0PointR, cur1PointR
											));
										}
										prevPointL = cur1PointL;
										prevPointR = cur1PointR;
										break;
									case 'miter':
									default:
										if (modify) {
											indices.push(...pushVertexMap(
												prevPointL, prevPointR, innerPoint,
												innerPoint, outerPoint, prevPointL
											));
										} else {
											indices.push(...pushVertexMap(
												prevPointL, prevPointR, innerPoint,
												innerPoint, prevPointR, outerPoint
											));
										}
										prevPointL = innerPoint;
										prevPointR = outerPoint;
										if (modify) {
											prevPointL = outerPoint;
											prevPointR = innerPoint;
										}
								}
							} else {
								switch (strokeLineJoin) {
									case 'round':
										if (modify) {
											indices.push(...pushVertexMap(
												prevPointL, prevPointR, cur0PointL,
												cur0PointL, prevPointR, cur0PointR
											));
											// 计算组成圆角的三角形
											let dot = new Vector2()
											.subVectors(cur0PointL, curPoint)
											.normalize()
											.dot(
												new Vector2()
												.subVectors(cur1PointL, curPoint)
												.normalize()
											);
											let angle = Math.PI;
											if (Math.abs(dot) < 1) angle = Math.abs(Math.acos(dot));
											angle /= 12;
											let leftPoint: Vector2 = cur0PointL.clone(),
												rightPoint: Vector2 = cur0PointL.clone();
											for (let i = 0; i < 12; i += 1) {
												rightPoint.rotateAround(curPoint, angle);
												indices.push(...pushVertexMap(
													curPoint, rightPoint, leftPoint
												));
												leftPoint.copy(rightPoint);
											}
										} else {
											indices.push(...pushVertexMap(
												prevPointL, prevPointR, cur0PointL,
												cur0PointL, prevPointR, cur0PointR
											));
											// 计算组成圆角的三角形
											let dot = new Vector2()
											.subVectors(cur0PointR, curPoint)
											.normalize()
											.dot(
												new Vector2()
												.subVectors(cur1PointR, curPoint)
												.normalize()
											);
											let angle = Math.PI;
											if (Math.abs(dot) < 1) angle = Math.abs(Math.acos(dot));
											angle /= 12;
											let leftPoint: Vector2 = cur0PointR.clone(),
												rightPoint: Vector2 = cur0PointR.clone();
											for (let i = 0; i < 12; i += 1) {
												rightPoint.rotateAround(curPoint, angle);
												indices.push(...pushVertexMap(
													curPoint, leftPoint, rightPoint
												));
												leftPoint.copy(rightPoint);
											}
										}
										break;
									case 'bevel':
										if (modify) {
											indices.push(...pushVertexMap(
												prevPointL, prevPointR, cur0PointL,
												cur0PointL, prevPointR, cur0PointR,
												curPoint, cur1PointL, cur0PointL,
											));
										} else {
											indices.push(...pushVertexMap(
												prevPointL, prevPointR, cur0PointL,
												cur0PointL, prevPointR, cur0PointR,
												curPoint, cur0PointR, cur1PointR,
											));
										}
										break;
									case 'miter':
									default:
										indices.push(...pushVertexMap(
											prevPointL, prevPointR, cur0PointL, cur0PointL, prevPointR, cur0PointR
										));
								}
								prevPointL = cur1PointL;
								prevPointR = cur1PointR;
							}
						} else {
							indices.push(...pushVertexMap(
								prevPointL, prevPointR, cur0PointL, cur0PointL, prevPointR, cur0PointR
							));
							prevPointL = cur0PointL;
							prevPointR = cur0PointR;
						}
					} else {
						// 最后一个点
						indices.push(...pushVertexMap(
							prevPointL, prevPointR, cur0PointL, cur0PointL, prevPointR, cur0PointR
						));
						// 不是闭合曲线，处理端点
						if (!isClose) {
							switch (strokeLineCap) {
								case 'square':
									// 第一个点端点平移
									let normalWidth = firstNormal
									.clone()
									.multiplyScalar(halfLineWidth);
									// 增量
									let incr = new Vector2(-normalWidth.y, normalWidth.x);
									let modifyL = firstPointL.clone().add(incr);
									let modifyR = firstPointR.clone().add(incr);
									indices.push(...pushVertexMap(
										modifyL, firstPointR, firstPointL, modifyL, modifyR, firstPointR
									));
									// 最后一个端点
									normalWidth = getNormal(curPoint, prevPoint).multiplyScalar(
										halfLineWidth
									);
									incr = new Vector2(normalWidth.y, -normalWidth.x);
									modifyL = cur0PointL.clone().add(incr);
									modifyR = cur0PointR.clone().add(incr);
									indices.push(...pushVertexMap(
										modifyL, modifyR, cur0PointR, cur0PointR, cur0PointL, modifyL
									));
									break;
								case 'round':
									// 计算组成圆角的三角形
									// 第一个点端点
									const angle = Math.PI / 12;
									let leftPoint: Vector2 = firstPointR.clone(),
										rightPoint: Vector2 = firstPointR.clone();
									for (let i = 0; i < 12; i += 1) {
										rightPoint.rotateAround(firstPoint, angle);
										indices.push(...pushVertexMap(
											firstPoint, leftPoint, rightPoint
										));
										leftPoint.copy(rightPoint);
									}
									// 最后一个端点
									leftPoint = cur0PointL.clone();
									rightPoint = cur0PointL.clone();
									for (let i = 0; i < 12; i += 1) {
										rightPoint.rotateAround(curPoint, angle);
										indices.push(...pushVertexMap(
											curPoint, rightPoint, leftPoint
										));
										leftPoint.copy(rightPoint);
									}
									break;
								case 'butt':
								// 默认情况不需处理
								default:
							}
						}
					}
					prevPoint = curPoint;
				}

				for (let i = 0, l  = vertices.length; i < l; i += 2) {
					setBoundary(new Vector2(vertices[i], vertices[i + 1]), boundary);
				}

				data.push({
					type: "stroke",
          color,
          strokeOpacity,
          vertices,
					indices,
        });
      });
    }
	});
	return {
		data,
		boundary
	};
}
interface IBoundary {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}
function setBoundary(vertex: Vector2, boundary: IBoundary): IBoundary {
	const x = vertex.x;
	const y = vertex.y
	if (x < boundary.minX) boundary.minX = x;
	if (x > boundary.maxX) boundary.maxX = x;
	if (y < boundary.minY) boundary.minY = y;
	if (y > boundary.maxY) boundary.maxY = y;
	return boundary;
}
export function getViewBox(boundary: IBoundary, needTrim: boolean) {
	const { maxX, minX, maxY, minY } = boundary;
	let viewBox = {
		width: maxX,
		height: maxY,
	};
	if (needTrim) {
		viewBox = {
			width: maxX - minX,
			height: maxY - minY,
		};
	}

	let vertexScale = 1;
	if (viewBox.width > viewBox.height) {
		if (viewBox.width > 1624) {
			vertexScale = 1624 / viewBox.width;
			viewBox.height *= vertexScale;
			viewBox.width = 1624;
		}
	} else {
		if (viewBox.height > 1624) {
			vertexScale = 1624 / viewBox.height;
			viewBox.width *= vertexScale;
			viewBox.height = 1624;
		}
	}
	return { viewBox, vertexScale };
}

