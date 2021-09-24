type UnitType = 'mm' | 'cm' | 'in' | 'pt' | 'pc' | 'px';

export type ContextAttributes = Partial<{
	alpha: boolean,
	depth: boolean,
	stencil: boolean,
	antialias: boolean,
	premultipliedAlpha: boolean,
	preserveDrawingBuffer: boolean,
	powerPreference: string,
	failIfMajorPerformanceCaveat: boolean
}>;

export type GLType = WebGLRenderingContext | WebGL2RenderingContext;
interface RenderConfig {
	needTrim?: boolean;
	needFill?: boolean;
	needStroke?: boolean;
}export interface DrawParams {
	canvas: HTMLCanvasElement;
	loc?: {
		x: number;
		y: number;
		width?: number;
		height?: number;
	};
	config?: RenderConfig;
}

export interface SvgLoader {
	draw: (params: DrawParams) => HTMLCanvasElement;
}

export interface Scope {
	defaultUnit: UnitType,
	defaultDPI: number
}

export interface Style {
	fill: string,
	fillOpacity: number,
	strokeOpacity: number,
	strokeWidth: number,
	strokeLineJoin: string,
	strokeLineCap: string,
	strokeMiterLimit: number,
}
export interface ViewBox {
	x: number;
	y: number;
	width: number,
	height:number
}
