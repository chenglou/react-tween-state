var webpack = require('webpack');

module.exports = {
  entry: {
    // https://github.com/webpack/webpack/issues/300
    lib: ['./index.js'],
    examples: './examples/index.jsx',
  },
  output: {
    filename: './[name]/index.js',
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, exclude: /build|node_modules/, loader: 'babel-loader?stage=0'},
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};

