import svgLoader from './index';

import svgUrl from '../public/static/svg/tiger.svg';

async function loadSvg() {
	// 加载&解析svg
	const canvas = document.getElementById('canvas') as HTMLCanvasElement;
	let gl = canvas.getContext('webgl');
	gl.clearColor(1, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);
	const loader = await svgLoader(svgUrl);
	//绘制svg
	loader.draw({
		canvas,
		loc: {
			x: 0,
			y: 0,
			width: 100,
			height: 100
		},
		config: {
			needTrim:false,
			needFill: true,
			needStroke: true
		}
	});
	loader.draw({
		canvas,
		loc: {
			x: 100,
			y: 100,
			width: 200,
			height: 200
		},
		config: {
			needTrim:true,
			needFill: true,
			needStroke: true
	 }});
}

loadSvg();
