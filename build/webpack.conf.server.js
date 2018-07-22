const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const base = require('./webpack.conf.base')
const config = require('./config')

const r = dir => path.resolve(__dirname, '..', dir)

const cssLoaders = !config.common.cssModules ? ['ignore-loader'] : [
    MiniCssExtractPlugin.loader,
    {
        loader: 'css-loader',
        options: {
            modules: true,
            localIdentName: '[path]_[name]_[local]_[hash:5]',
            sourceMap: true,
            importLoaders: 2
        }
    },
    {
        loader: 'postcss-loader',
        options: {
            ident: 'postcss',
            plugins: () => [
                require('postcss-flexbugs-fixes'),
                require('autoprefixer')({
                    browsers: [
                        '>1%',
                        'last 4 versions',
                        'Firefox ESR',
                        'not ie < 9'
                    ],
                    flexbox: 'no-2009'
                })
            ],
            sourceMap: true
        }
    },
    {
        loader: 'stylus-loader',
        options: {
            sourceMap: true
        }
    }
]

module.exports = merge(base, {
    mode: process.env.NODE_ENV || 'development',
    target: 'node',
    entry: {
        app: './src/entry-server.js'
    },
    output: {
        filename: 'server.bundle.js',
        path: r('dist'),
        publicPath: process.env.NODE_ENV === 'development' ? config.dev.publicPath : config.prod.publicPath,
        libraryTarget: 'commonjs2'
    },
    externals: [Object.keys(require('../package').dependencies)],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: {
                    loader: 'babel-loader'
                },
                include: r('src')
            },
            {
                test: /\.(css|styl)$/,
                use: cssLoaders
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                isClient: 'false',
                isServer: 'true'
            }
        })
    ].concat(config.common.cssModules ? [
        new MiniCssExtractPlugin({
            filename: 'server/[name].css',
            chunkFilename: 'server/[name].css'
        })
    ] : [])
})
