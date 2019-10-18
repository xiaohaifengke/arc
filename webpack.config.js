const path = require('path')

module.exports = {
  mode: 'production',
  // mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'arc-points.js',
    // filename: 'arc-points.dev.js',
    path: path.resolve(__dirname, 'lib'),
    library: 'arc',
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
