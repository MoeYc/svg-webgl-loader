# svg-webgl-loader
## 简介
svg-webgl-loader，一个将svg渲染在canvas(webgl)上的工具库。
## 安装
### npm/yarn安装
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
若需要特定版本，比如1.0.1版本，则可带上版本号：
```
<script src="https://unpkg.com/svg-webgl-loader@1.0.1/dist/js/index.umd.js"></script>

```
## 使用示例
```
import svgLoader from "svg-webgl-loader";
import svgUrl from "./img/test.svg";
// 加载解析svg数据
const svgData = await svgLoader(svgUrl);
// 绘制
svgData.draw({
	canvas,
	loc: {
		x: 0,
		y: 0,
		width: 300,
		height: 300
	},
})
```
效果可见[demo](https://codepen.io/yh418807968/pen/GREMPXw?editors=1011)
> 如果需要，可以通过
> ```
> let gl = canvas.getContext('webgl');
> gl.clearColor(1, 1, 1, 1);
> gl.clear(gl.COLOR_BUFFER_BIT);
> ```
> 修改背景颜色

## API
### draw
使用：
```
const svgData = await svgLoader(svgUrl);
svgData.draw(drawParams)
```
输入参数：
```
interface drawParams {
	canvas: HTMLCanvasElement, // 待绘制的画布canvas
	loc?: { // 绘制区域
		x: 0,
		y: 0,
		width?: 300, // 绘制宽度，默认为svg图片本身宽度
		height?: 300 // 绘制宽度，默认为svg图片本身宽度
	},
	config?: {
		needTrim?:true, // 是否需要去除svg边缘空白，默认false
		needFill?: true, // 是否需要填充，默认true
		needStroke?: true // 是否需要描边， 默认true
	}
}
```
## 说明
svg-webgl-loader主要是参考[three.js](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_loader_svg.html)中加载渲染svg的方案：通过解析路径、路径离散化、三角化，将svg分解为众多三角形，从而使得其可以通过webgl shader渲染。


