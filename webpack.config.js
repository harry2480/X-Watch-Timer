const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const tailwindcss = require('@tailwindcss/postcss');
const autoprefixer = require('autoprefixer');

module.exports = {
    mode: 'production',
    entry: {
        popup: path.resolve(__dirname, 'src/popup/index.tsx'),
        options: path.resolve(__dirname, 'src/options/index.tsx'),
        content: path.resolve(__dirname, 'src/content/index.tsx'),
        background: path.resolve(__dirname, 'src/background/index.ts'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [tailwindcss, autoprefixer],
                            },
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: 'src/manifest.json', to: 'manifest.json' }],
        }),
        ...getHtmlPlugins(['popup', 'options']),
    ],
};

function getHtmlPlugins(chunks) {
    return chunks.map(
        (chunk) =>
            new HtmlWebpackPlugin({
                title: 'X Watch Timer',
                filename: `${chunk}.html`,
                chunks: [chunk],
            })
    );
}
