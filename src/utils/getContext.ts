import { DEFAULT_GL_Attributes } from '@/core/createProgram';

export const CONTEXT_NAMES = ['webgl2', 'webgl', 'experimental-webgl'];

export function getWebGLContext(canvas: HTMLCanvasElement, contextAttributes?: ContextAttributes): GLType {
	let gl = getContext(canvas, contextAttributes);

	if (gl === null) {
		gl = getContext(canvas);
		if (gl) {
			console.warn(`Error creating WebGL context with DEFAULT_GL_Attributes. ${JSON.stringify(DEFAULT_GL_Attributes)}`);
			return gl;
		} else {
			throw new Error('Error creating WebGL context.');
		}
	}
	return gl;
}

export function getContext(canvas: HTMLCanvasElement, contextAttributes?: ContextAttributes): GLType {
	for (let i = 0; i < CONTEXT_NAMES.length; i++) {
		const contextName = CONTEXT_NAMES[i];
		const context = canvas.getContext(contextName, contextAttributes) as GLType;
		if (context !== null) {
			return context;
		}
	}
	return null;
}
