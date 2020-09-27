const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push({
  test: /\.(woff|woff2|eot|ttf|otf)$/,
  use: "file-loader"
});

rules.push({
  test: /\.(jpg|png|svg|ico|icns)$/,
  loader: "file-loader",
  options: {
    name: "[path][name].[ext]",
    publicPath: "..", // move up from 'main_window'
    context: "src", // set relative working folder to src
  },
});

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
  },
};
