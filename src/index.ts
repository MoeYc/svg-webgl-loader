import { load } from '@/utils/load';
import { parse } from '@/core/parse';
import { createProgram } from '@/core/createProgram';
import { getViewBox, parsePathToData } from '@/core/parsePathToData';
import { paint } from '@/core/paint';
import { InputParams} from './types/types';

export default async function init(params: InputParams): Promise<HTMLCanvasElement> {
	const { svgUrl, config, canvas} = params;
	const { needTrim = false, needFill = true, needStroke = true } = config || {};
	// 加载svg
	const text = await load(svgUrl);
	// 解析svg路径
	const paths = parse(text);

	// 路径解析为数据
	const { data, boundary } = parsePathToData(paths, needFill, needStroke);
	// 获取绘制区域& 缩放大小
	const { viewBox, vertexScale } = getViewBox(boundary, needTrim);
	// webgl环境配置
	const { program, gl, canvasReturn } = createProgram(viewBox, canvas);

	gl.clearColor(1, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);
	// 绘制·
	paint(gl, program, data, boundary, vertexScale, needTrim);
	return canvasReturn;
}

