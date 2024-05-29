const rspack = require("@rspack/core");
const refreshPlugin = require("@rspack/plugin-react-refresh");
const isDev = process.env.NODE_ENV === "development";
const { ModuleFederationPlugin } = require("@module-federation/enhanced/rspack");

const path = require("path");
const deps = require("./package.json").dependencies;
const HTTPS = process.env.HTTPS ?? null;


const name = "runhost";
const name1 = name + "1";
/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = {
  //context: __dirname,
  entry: {
    main: "./src/index.tsx",
  },
  resolve: {
    extensions: ["...", ".ts", ".tsx", ".jsx"],
  },
  optimization: {
    minimize: false,
  },
  devServer: {
    port: 3000,
    hot: true,
    client: {
      webSocketURL:`ws${HTTPS ? 's' : ''}://localhost:3000/ws`,
    },
    static: {
      directory: path.join(__dirname, "build"),
    },
    liveReload: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
    },
  },

  devtool: "source-map",
  optimization: { minimize: false },
  output: {
    path: __dirname + "/dist",
    uniqueName: name1,
    publicPath: "auto",
    filename: "[name].js",
  },
  watch: true,
  watchOptions: {
      ignored: /node_modules/,
      poll: 500,
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: "asset",
      },
      {
        test: /\.(jsx?|tsx?)$/,

        exclude: /(node_modules|\.webpack)/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              sourceMap: true,
              jsc: {
                parser: {
                  syntax: "typescript",
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: "automatic",
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
              env: {
                targets: ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new rspack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
    new rspack.ProgressPlugin({}),

    isDev && new rspack.HotModuleReplacementPlugin(),
    new rspack.HtmlRspackPlugin({
      template: "./index.html",
      excludedChunks: [name],
      filename: "index.html",
      inject: true,
      publicPath: "/",
    }),
    new ModuleFederationPlugin({
      name: name,
      filename: "remoteEntry.js",
      //   remotes: {
      //    app_02: "app_02@http://localhost:3001/mf-manifest.json",
      // },
      shared: ["react", "react-dom"],
      dts: false,
    }),
    isDev ? new refreshPlugin() : null,
  ].filter(Boolean),
};
