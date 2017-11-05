/* global __dirname, require, module*/

const webpack = require("webpack");
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const path = require("path");
const env = require("yargs").argv.env; // use --env with webpack 2
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");

let libraryName = "sw";

let plugins = [], outputFile;

if (env === "build") {
    plugins.push(new UglifyJsPlugin({minimize: true}));
    outputFile = libraryName + ".min.js";
} else {
    plugins.push(new BrowserSyncPlugin({
        // BrowserSync options
        // browse to http://localhost:3000/ during development
        host: "localhost",
        port: 3000,
        // proxy the Webpack Dev Server endpoint
        // (which should be serving on http://localhost:3100/)
        // through BrowserSync
        proxy: "http://localhost:3100/"
    }, {
        // prevent BrowserSync from reloading the page
        // and let Webpack Dev Server take care of this
        reload: false
    }));
    outputFile = libraryName + ".js";
}

const config = {
    entry: __dirname + "/src/index.js",
    devtool: "source-map",
    output: {
        path: __dirname + "/lib",
        filename: outputFile,
        library: libraryName,
        libraryTarget: "umd",
        umdNamedDefine: true,
        publicPath: __dirname + "/lib"
    },
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/,
                loader: "babel-loader",
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /(\.jsx|\.js)$/,
                loader: "eslint-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        modules: [path.resolve("./node_modules"), path.resolve("./src")],
        extensions: [".json", ".js"]
    },
    plugins: plugins
};

module.exports = config;
