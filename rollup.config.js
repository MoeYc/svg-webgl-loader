import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import pkg from './package.json';

const path = require('path');

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.browser,
      name: 'svgWebglLoader',
      format: 'umd',
    },
    {
      file: pkg.module,
      // name: 'svgWebglLoader',
			format: 'es',
    },
  ],
  plugins: [
    json(),
    alias({
      entries: [{ find: '@', replacement: path.resolve(__dirname, './src') }],
      resolve: ['.js', '.ts'],
    }),
    commonjs(),
    resolve({
      preferBuiltins: true,
      mainFields: ['browser', 'module'],
    }),
    typescript(),
    terser({
      compress: {
        // 去掉console.log函数
        pure_funcs: ['console.log'],
      },
    }),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.js', '.ts'],
    }),
  ],
};
