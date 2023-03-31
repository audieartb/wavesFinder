const path = require("path");

const rootConfig = {
  mode: "development",
  optimization: {
    usedExports: true,
  },
  devtool: "eval-source-map",
};
const appConfig = {
  ...rootConfig,
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "public/scripts"),
  },
  experiments: {
    topLevelAwait: true,
  },
};

module.exports = [appConfig];
