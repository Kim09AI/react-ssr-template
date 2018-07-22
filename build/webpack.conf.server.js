const webpack = require('webpack')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const r = dir => path.resolve(__dirname, '..', dir)

module.exports = {
    context: r('.'),
    mode: process.env.NODE_ENV || 'development',
    target: 'node',
    entry: {
        app: './src/entry-server.js'
    },
    output: {
        filename: 'server.bundle.js',
        path: r('dist'),
        publicPath: process.env.NODE_ENV === 'development' ? '/public/' : '/',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['.jsx', '.js', '.json'],
        alias: {
            '~': r('src')
        }
    },
    externals: [Object.keys(require('../package').dependencies)],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loader: 'eslint-loader',
                exclude: r('node_modules'),
                enforce: 'pre'
            },
            {
                test: /\.(js|jsx)$/,
                use: {
                    loader: 'babel-loader'
                },
                include: r('src')
            },
            {
                test: /\.(css|styl)$/,
                use: [
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
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'static/img/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'static/media/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'static/fonts/[name].[hash:7].[ext]'
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                isClient: 'false',
                isServer: 'true'
            }
        }),
        new MiniCssExtractPlugin({
            filename: 'server/[name].css',
            chunkFilename: 'server/[name].css'
        })
    ]
}
