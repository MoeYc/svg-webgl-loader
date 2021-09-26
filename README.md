
English | [简体中文](./README-zh_CN.md)

# svg-webgl-loader

## Introduction

svg-webgl-loader, a tool for rendering svg on canvas(webgl).

## Installation

### npm/yarn

```shell
npm i svg-webgl-loader
```

```shell
yarn add svg-webgl-loader
```

### CDN

```html
<script src="https://unpkg.com/svg-webgl-loader/dist/js/index.umd.js"></script>

```

If you need a specific version, such as version 1.0.1, you can add the version number:

```html
<script src="https://unpkg.com/svg-webgl-loader@1.0.1/dist/js/index.umd.js"></script>

```

## Usage

```js
import svgLoader from "svg-webgl-loader";
import svgUrl from "./img/test.svg";

// load and parse svg data
const svgData = await svgLoader(svgUrl);

// paint
svgData.draw({
  canvas,
  loc: {
    x: 0,
    y: 0,
    width: 300,
    height: 300,
  },
});

```

[demo](https://codepen.io/yh418807968/pen/GREMPXw?editors=1011)

> If necessary, you can modify the background color through：
> ```js
> let gl = canvas.getContext('webgl');
> gl.clearColor(1, 1, 1, 1);
> gl.clear(gl.COLOR_BUFFER_BIT);
> ```
>
## API

### draw

usage：
```js
const svgData = await svgLoader(svgUrl);
svgData.draw(drawParams)
```

```js
interface drawParams {
  canvas: HTMLCanvasElement; // the canvas to be rendered on
  loc?: {
    // location for painting
    x: 0,
    y: 0,
    width?: 300, // width for painting，default is the width of svg
    height?: 300, // height for painting, default is the height of svg
  };
  config?: {
    needTrim?: true, // whether need to erase, default value is false
    needFill?: true, // whether need to fill svg, default value is true
    needStroke?: true, // whether need to stroke svg, default value is true
  };
}

```

## Remark

svg-webgl-loader mainly refers to the scheme of rendering svg in [three.js](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_loader_svg.html): parse the paths, discrete paths to points and triangulate, then the svg would be analyzed to many triangles, so that it can be rendered by the webgl shader.








