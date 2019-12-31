const path = require("path");

module.exports = {
    mode: "development",
    entry: path.join(__dirname, "src", "index.tsx"),
    output: {
        path: path.join(__dirname, "build"),
        filename: "build.js",
        library: "react path search",
        libraryTarget: "umd",
        umdNamedDefine: true,
    },
    devServer: {
        contentBase: [path.join(__dirname, "build")],
        compress: true,
        port: 3000,
    },
    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    module: {
        rules: [
            {
                test: /\.(js|ts|tsx|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-react",
                            "@babel/preset-typescript",
                            "@babel/preset-env",
                        ],
                        plugins: ["@babel/plugin-proposal-class-properties"],
                    },
                },
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "fonts/",
                        },
                    },
                ],
            },
        ],
    },
};
