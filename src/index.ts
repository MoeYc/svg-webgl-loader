import { load } from '@/utils/load';
import { parse } from '@/core/parse';
import { createProgram } from '@/core/createProgram';
import { getViewBox, parsePathToData } from '@/core/parsePathToData';
import { paint } from '@/core/paint';
import { SvgLoader, DrawParams } from './types/types';


export default async function init(svgUrl: string): Promise<SvgLoader> {
	// 加载svg
	const text = await load(svgUrl);
	// 解析svg路径
	const {paths, viewBox} = parse(text);
	// 路径解析为数据
	const { data, boundary } = parsePathToData(paths);

	let svgLoader: SvgLoader = {
		draw: null
	};
	svgLoader.draw = (params: DrawParams): HTMLCanvasElement => {
		const defaultConfig = {
			needTrim: false,
			needFill: true,
			needStroke: true
		}
		let { loc, canvas, config = defaultConfig } = params;
		// 获取真正绘制区域
		const realViewBox = getViewBox(viewBox, boundary, config.needTrim);
		const defaultLoc = {
			x: 0,
			y: 0,
			width: realViewBox.width,
			height:realViewBox.height
		}
		loc = loc || defaultLoc;
		loc.width = loc.width || realViewBox.width;
		loc.height = loc.height || realViewBox.height;
		const { program, gl } = createProgram(canvas);
		// gl.clearColor(1, 1, 1, 1);
		// gl.clear(gl.COLOR_BUFFER_BIT);
		paint(gl, program, canvas, data, realViewBox, loc, config);
		return canvas;
	}
	return svgLoader;
}
