
export function paint(gl, program, data, boundary, vertexScale, needTrim) {
	const a_Position = gl.getAttribLocation(program, 'a_Position');
	const u_FragColor = gl.getUniformLocation(program, 'u_FragColor');
	data.forEach((item) => {
		const type = item.type;
		let vertices, vao, indices;
		if (type === 'fill') {
			const fill = item;
				toggleBlend(gl,fill?.fillOpacity);
				gl.uniform4f(
					u_FragColor,
					fill.color.r,
					fill.color.g,
					fill.color.b,
					fill.fillOpacity
				);

				vertices = fill.vertices;
				indices = fill.indices;
				// 绑定和启用缓冲
				vao = getVertices(vertices, boundary, vertexScale, needTrim);
				drawVertexWithIndices(gl, a_Position, vao, indices);
		}
		if (type === 'stroke') {
				const stroke = item;
				toggleBlend(gl,stroke?.strokeOpacity);
				gl.uniform4f(
					u_FragColor,
					stroke.color.r,
					stroke.color.g,
					stroke.color.b,
					stroke.strokeOpacity
				);

				vertices = stroke.vertices;
				indices = stroke.indices;

				// 绑定和启用缓冲
				vao = getVertices(vertices, boundary, vertexScale, needTrim);


				drawVertexWithIndices(gl, a_Position, vao, indices);
		}

	})

}
interface IBoundary {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}
function getVertices(vertices: number[], boundary: IBoundary, vertexScale: number, needTrim: boolean): number[] {
	let offsetX = 0;
	let offsetY = 0;
	let halfWidth = boundary.maxX / 2;
	let halfHeight = boundary.maxY / 2;
	if (needTrim) {
		offsetX = boundary.minX;
		offsetY = boundary.minY;
		halfWidth = (boundary.maxX - boundary.minX) / 2;
		halfHeight = (boundary.maxY - boundary.minY) / 2;
	}
	return vertices
		.map((v, i) =>(i % 2 === 0 ? ((v - offsetX) * vertexScale - halfWidth) / halfWidth : (halfHeight - (v - offsetY) * vertexScale) / halfHeight));
}
function toggleBlend(gl, opacity) {
	if (!opacity) return;
	if (opacity < 1) {
		gl.enable(gl.BLEND);
		gl.blendFuncSeparate(
			gl.SRC_ALPHA,
			gl.ONE_MINUS_SRC_ALPHA,
			gl.ONE,
			gl.ONE_MINUS_SRC_ALPHA
		);
	} else {
		gl.disable(gl.BLEND);
	}
}

function drawVertexWithIndices(gl, a_Position: number, vertices: number[], indices: number[]) {
	const vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(
		gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(indices),
		gl.STATIC_DRAW
	);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(
		a_Position,
		2,
		gl.FLOAT,
		false,
		Float32Array.BYTES_PER_ELEMENT * 2,
		0
	);
	gl.enableVertexAttribArray(a_Position);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}
