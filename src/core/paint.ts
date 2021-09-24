
export function paint(gl, program, canvas, data, viewBox, loc, config) {
	const a_Position = gl.getAttribLocation(program, 'a_Position');
	const u_FragColor = gl.getUniformLocation(program, 'u_FragColor');
	const { needFill, needStroke} = config || {};
	data.forEach((item) => {
		const type = item.type;
		let vertices, vao, indices;
		if (type === 'fill' && needFill) {
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
			vao = getVertices(vertices, viewBox, loc, canvas);
				drawVertexWithIndices(gl, a_Position, vao, indices);
		}
		if (type === 'stroke' && needStroke) {
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
				vao = getVertices(vertices, viewBox, loc, canvas);
				drawVertexWithIndices(gl, a_Position, vao, indices);
		}
	})

}

function getVertices(vertices: number[], viewBox, loc, canvas): number[] {
	const { x, y, width, height } = loc;
	const halfWidth = canvas.width / 2;
	const halfHeight = canvas.height / 2;
	return vertices
		.map((v, i) =>(i % 2 === 0 ? (width/viewBox.width * (v-viewBox.x) + x - halfWidth)/ halfWidth :(halfHeight - (height/viewBox.height* (v-viewBox.y) + y))/halfHeight));
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
