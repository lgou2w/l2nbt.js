const TerserPlugin = require('terser-webpack-plugin')
const isProduction = process.env.NODE_ENV === 'production'
const path = require('path')

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: {
    l2nbt: './src/index.ts',
    'l2nbt.min': './src/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'l2nbt',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        include: /\.min\.js$/
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/
      }
    ]
  }
}
