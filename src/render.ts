import { parse } from '@/core/parse';
import { createProgram } from '@/core/createProgram';
import { getViewBox, parsePathToData } from '@/core/parsePathToData';
import { paint } from '@/core/paint';


let _gl: WebGLRenderingContext = null;

export async function initWithText(svgCache: string, config: Config) {
	const { needTrim, needFill, needStroke } = config;
	// 加载svg
	// const text = await load(svgUrl);
	// 解析svg路径
	const paths = parse(svgCache);

	// 路径解析为数据
	const { data, boundary } = parsePathToData(paths, needFill, needStroke);
	// 获取绘制区域& 缩放大小
	const { viewBox, vertexScale } = getViewBox(boundary, needTrim);
	// webgl环境配置
	if (_gl) {
		(_gl.canvas as HTMLCanvasElement).parentNode.removeChild(_gl.canvas as HTMLCanvasElement);
	}
	const { program, gl } = createProgram(viewBox);
	_gl = gl;
	gl.clearColor(1, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);
	// 绘制
	paint(gl, program, data, boundary, vertexScale, needTrim);
}


interface Config {
	needTrim?: boolean;
	needFill?: boolean;
	needStroke?: boolean;
}

const config = {
	needTrim: true,
	needFill: true,
	needStroke: true
};


(() => {
	let needTrim = false;
	let svgCache = '';
	const init = () => {
		const fileBtn = document.getElementById('file');
		fileBtn.onchange = (event: any) => {
			const file = event.target.files[0];
			const reader = new FileReader();
			reader.readAsBinaryString(file);
			reader.onload = function() {
				svgCache = this.result.toString();
				console.log(svgCache);

				initWithText(svgCache, Object.assign(config, { needTrim }));
			};
		};
		const checkBox = document.getElementById('cb');
		checkBox.onchange = (event: any) => {
			const checked = event.target.checked;
			if (needTrim !== checked) {
				initWithText(svgCache, Object.assign(config, { needTrim: checked }));
			}
			needTrim = checked;
		};
	};
	if (document.addEventListener) {
		const readyFn = function() {
			document.removeEventListener('DOMContentLoaded', readyFn, false);
			init();
		};
		document.addEventListener('DOMContentLoaded', readyFn, false);
	} else {
		setTimeout(init, 500);
	}
})();
