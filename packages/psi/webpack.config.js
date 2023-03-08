const packageJson = require("./package.json");
const __basedir = require("path").resolve(__dirname, "../../");

module.exports = {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".wasm"],
  },
  optimization: {
    minimize: false,
    mangleWasmImports: true,
    usedExports: true,
  },
  target: "web",
  entry: {
    phi: {
      import: "./src/index.ts",
      library: {
        type: "global",
      },
    },
  },
  output: {
    filename: `[name]-${packageJson.version}.js`,
    path: __dirname + "/dist",
    libraryTarget: "umd",
  },
  plugins: [
    //new BundleAnalyzerPlugin(),
    //   new HtmlWebpackPlugin({
    //     title: "The Empty Mainnet App",
    //   }),
  ],
  resolve: {
    alias: {},
    fallback: {},
  },
};
