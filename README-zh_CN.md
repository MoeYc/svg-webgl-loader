# svg-webgl-loader
## 简介
svg-webgl-loader，一个将svg渲染在webgl（canvas）上的工具库。
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

## 使用示例
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
输入：
* 【必传】svgUrl: svg的地址，可以是本地文件，也可以是线上地址
* 【可选】config: 渲染相关的配置
  * needTrim：是否需要去除svg边缘空白，默认false
  * needFill：是否需要填充，默认true
  * needStroke：是否需要描边， 默认true
* 【可选】canvas: 待渲染的画布，若不传，则新建canvas。

输出：

输出为已经渲染了svg的canvas对象，此对象为传入的canvas对象或者内部新建的canvas对象。

## 说明
svg-webgl-loader主要是参考[three.js](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_loader_svg.html)中加载渲染svg的方案：通过解析路径、路径离散化、三角化，将svg分解为众多三角形，从而使得其可以通过webgl shader渲染。


