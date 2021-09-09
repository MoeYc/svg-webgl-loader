const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path'); // 处理绝对路径

const resolve = (...args) => {
	return path.resolve(__dirname, ...args);
}

const config = {
  entry: {
		render: resolve('..', 'src', 'render.ts'),
		demo: resolve('..', 'src', 'demo.ts'),
	},
  output: {
    path: path.resolve('../dist'), //打包后的文件存放的地方
    filename: '[name].[hash:6].js', //打包后输出文件的文件名
  },
  target: process.env.NODE_ENV === 'development' ? 'web' : 'browserslist',
  devtool: false,
  resolve: {
		extensions: ['.ts', '.js'],
		alias: {
      "@": path.resolve(__dirname, '../src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['babel-loader', 'ts-loader'],
        exclude: [/node_modules/],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
      },
    ],
  },
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'render.html',
			template: resolve('..', 'public', 'render.html'),
			inject: true,
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeAttributeQuotes: true,
			},
			chunks: ['render'],
		}),
		new HtmlWebpackPlugin({
			filename: 'demo.html',
			template: resolve('..', 'public', 'demo.html'),
			inject: true,
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeAttributeQuotes: true,
			},
			chunks: ['demo'],
		}),
	],
};

module.exports =  config;
