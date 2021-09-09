declare module '*.svg';

type UnitType = 'mm' | 'cm' | 'in' | 'pt' | 'pc' | 'px';

type ContextAttributes = Partial<{
	alpha: boolean,
	depth: boolean,
	stencil: boolean,
	antialias: boolean,
	premultipliedAlpha: boolean,
	preserveDrawingBuffer: boolean,
	powerPreference: string,
	failIfMajorPerformanceCaveat: boolean
}>;

type GLType = WebGLRenderingContext | WebGL2RenderingContext;
interface InputParams {
	svgUrl: string;
	config?: RenderConfig,
	canvas?: HTMLCanvasElement
}
interface RenderConfig {
	needTrim?: boolean;
	needFill?: boolean;
	needStroke?: boolean;
}

interface Scope {
	defaultUnit: UnitType,
	defaultDPI: number
}

interface Style {
	fill: string,
	fillOpacity: number,
	strokeOpacity: number,
	strokeWidth: number,
	strokeLineJoin: string,
	strokeLineCap: string,
	strokeMiterLimit: number,
}
