import { getWebGLContext } from '@/utils/getContext';

export const DEFAULT_GL_Attributes = {
	alpha: false,
	depth: true,
	stencil: true,
	antialias: true,
	premultipliedAlpha: true,
	preserveDrawingBuffer: false,
	powerPreference: 'default',
	failIfMajorPerformanceCaveat: false,
};

export function createProgram(viewBox, canvas?: HTMLCanvasElement) {
	// 顶点着色器
	const vs_source = `
		attribute vec4 a_Position;

		void main() {
		  gl_Position = a_Position;
		}
  `;

	// 片元着色器
	const fs_source = `
		precision mediump float;
		uniform vec4 u_FragColor;

		void main() {
		   gl_FragColor = u_FragColor;
		}
	`;

	// let canvas = document.getElementById(id) as HTMLCanvasElement;
	if (!canvas) {
		canvas = document.createElement('canvas');
		// document.body.appendChild(canvas);
	}

	const gl = getWebGLContext(canvas, DEFAULT_GL_Attributes);
	const [ MAX_WIDTH, MAX_HEIGHT ] = gl.getParameter(gl.MAX_VIEWPORT_DIMS);

	const setCanvasSize = (canvas, viewBox) => {
		let width = viewBox.width * 2;
		let height = viewBox.height * 2;
		if (width > MAX_WIDTH) {
			console.warn(`width exceed! width: ${width} MAX_WIDTH: ${MAX_WIDTH}, auto changed to MAX_WIDTH`);
			width = MAX_WIDTH;
		} else if (width < 0) {
			console.warn(`Error width: ${width}`);
			width = 0;
		}
		if (height > MAX_HEIGHT) {
			console.warn(`height exceed! height: ${height} MAX_HEIGHT: ${MAX_HEIGHT}, auto changed to MAX_HEIGHT`);
			height = MAX_HEIGHT;
		} else if (height < 0) {
			console.warn(`Error height: ${height}`);
			height = 0;
		}
		canvas.width = width;
		canvas.height = height;
		canvas.style.width = viewBox.width + 'px';
		canvas.style.height = viewBox.height + 'px';
		gl.viewport(0, 0, canvas.width, canvas.height);
	}
	setCanvasSize(canvas, viewBox);

	// 创建shader
	const vs_shader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vs_shader, vs_source);
	gl.compileShader(vs_shader);
	if (!gl.getShaderParameter(vs_shader, gl.COMPILE_STATUS)) {
		const error = gl.getShaderInfoLog(vs_shader);
		gl.deleteShader(vs_shader);
		throw new Error('Failed to compile vs_shader:' + error);
	}
	var fs_shader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fs_shader, fs_source);
	gl.compileShader(fs_shader);
	if (!gl.getShaderParameter(fs_shader, gl.COMPILE_STATUS)) {
		const error = gl.getShaderInfoLog(fs_shader);
		gl.deleteShader(fs_shader);
		throw new Error('Failed to compile fs_shader:' + error);
	}
	// 创建program
	const program = gl.createProgram();
	gl.attachShader(program, vs_shader);
	gl.attachShader(program, fs_shader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const error = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		gl.deleteShader(fs_shader);
		gl.deleteShader(vs_shader);
		throw new Error('无法链接程序对象：' + error);
	}
	gl.useProgram(program);

	return { program, gl, canvasReturn: canvas };
}
