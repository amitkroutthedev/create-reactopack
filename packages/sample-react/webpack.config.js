const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const detect = require('detect-port-alt');


const desiredPort = 3000;

module.exports = async (env, argv) => {
  let newPort = await detect(desiredPort);
  if (newPort !== desiredPort) {
    console.log(`Port ${desiredPort} is busy. Trying another port...`);
    const availablePort = await detect(desiredPort + 1);
    console.log(`Found available port ${availablePort}.`);
    newPort = availablePort;
  }
  return {
    mode: "development",
    entry: "/src/index.jsx", // main js
    output: {
      path: path.resolve(__dirname, "dist"), // output folder
      publicPath: "/",
    },
    target: 'web',
    devServer: {
      port: newPort,
      static: {
        directory: path.join(__dirname, 'public')
      },
      open: true,
      hot: true,
      liveReload: true,
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.js|\.jsx$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            "style-loader",
            "css-loader",
            "postcss-loader" // for styles
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html", // base html
      }),
    ],
  }
}