const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'arc-points.js',
    path: path.resolve(__dirname, 'lib'),
    library: 'arcPoints',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  devtool: 'none',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        // include: [path.resolve(__dirname, './src')],
        exclude: /node_modules/
      }
    ]
  }
}
