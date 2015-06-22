module.exports = {
  entry: {
    // https://github.com/webpack/webpack/issues/300
    lib: ['./index.js'],
    examples: './examples/index.jsx',
  },
  output: {
    filename: './[name]/index.js',
    libraryTarget: 'umd',
    library: 'tweenState',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel?stage=0',
      },
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};
