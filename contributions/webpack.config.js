const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");

// Webpack entry points. Mapping from resulting bundle name to the source file entry.
const entries = {};
const DEFAULT_PORT = "8765";
const DEFAULT_HOST = "localhost";
const DEFAULT_PROTOCOL = "https";
const DEFAULT_DIST_DIR = "dist";
const DEFAULT_STATIC_DIR = "static";
const DEFAULT_SRC_DIR = "src/Contributions";

// Loop through subfolders in the "Samples" folder and add an entry for each one
const samplesDir = path.join(__dirname, DEFAULT_SRC_DIR);
fs.readdirSync(samplesDir).filter(dir => {
    if (fs.statSync(path.join(samplesDir, dir)).isDirectory()) {
        entries[dir] = "./" + path.relative(process.cwd(), path.join(samplesDir, dir, dir));
    }
});

module.exports = (env, argv) => ({
    entry: entries,
    output: {
        filename: "[name]/[name].js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            "azure-devops-extension-sdk": path.resolve("node_modules/azure-devops-extension-sdk")
        },
    },
    stats: {
        warnings: false
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/, 
                type: 'asset/inline'
            },
            {
                test: /\.html$/, 
                type: 'asset/resource'
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
           patterns: [ 
               { from: "**/*.html", context: DEFAULT_SRC_DIR }
           ]
        })
    ],  ...{
        devtool: 'inline-source-map',
        devServer: {
            server: "https",
            port: DEFAULT_PORT,
        static: {
            serveIndex: false,
            directory: DEFAULT_STATIC_DIR,
            publicPath: `/${DEFAULT_STATIC_DIR}`
        },
        proxy: [{
                context: [`/${DEFAULT_DIST_DIR}`],
                secure: false,
                target: `${DEFAULT_PROTOCOL}://${DEFAULT_HOST}:${DEFAULT_PORT}`,
                pathRewrite: { "/dist": "" }
            },
        ],
        hot: true,
        }
    }
});