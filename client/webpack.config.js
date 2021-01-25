const webpack = require('webpack');

const config = {
  mode: 'development',
  entry: __dirname + '/src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif|ico)$/,
        use: ["url-loader"],
      }
    ]
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    contentBase: __dirname + '/dist',
    hot: true,
    historyApiFallback: true,
    port: 5000,
    proxy: {
      "/api": "http://localhost:3000",
    }
  },
  devtool: 'inline-source-map',
};

module.exports = config;
