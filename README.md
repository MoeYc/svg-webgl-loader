
English | [简体中文](./README-zh_CN.md)
# svg-webgl-loader
## Introduction
svg-webgl-loader， a tool for rendering svg on canvas(webgl).
## Installation

### npm/yarn
```
npm i svg-webgl-loader
```
```
yarn add svg-webgl-loader
```
### CDN
```
<script src="https://unpkg.com/svg-webgl-loader/dist/js/index.umd.js"></script>

```
If you need a specific version, such as version 1.0.1, you can add the version number:
```
<script src="https://unpkg.com/svg-webgl-loader@1.0.1/dist/js/index.umd.js"></script>

```
## Usage
```
import svgLoader from "svg-webgl-loader";
import svgUrl from "./img/test.svg";
const canvasResult = await svgLoader({
	svgUrl,
	config: {
		needTrim: true,
		needFill: true,
		needStroke: true
	},
	canvas
})
```
[demo](https://codepen.io/yh418807968/pen/GREMPXw?editors=1011)

input：
* svgUrl(required): url of svg，local file path and online url are accepted
* config(optional): some config params
  * needTrim(optional)：whether need to erase, default value is false
  * needFill：whether need to fill svg, default value is true
  * needStroke：whether need to stroke svg, default value is true
* canvas(optional): the canvas to be rendered on, default is a new canvas created inside

output:

a canvas svg has been rendered on, from the "canvas" of input params or a new canvas created inside

## Remark
svg-webgl-loader mainly refers to the scheme of rendering svg in [three.js](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_loader_svg.html): parse the paths, discrete paths to points and triangulate, then the svg would be analyzed to many triangles, so that it can be rendered by the webgl shader.








