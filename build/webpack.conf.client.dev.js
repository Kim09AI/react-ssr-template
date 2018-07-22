const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

const r = dir => path.resolve(__dirname, '..', dir)

module.exports = {
    context: r('.'),
    mode: 'development',
    devtool: '#cheap-module-source-map',
    entry: {
        app: ['react-hot-loader/patch', './src/entry-client.js']
    },
    output: {
        filename: 'static/js/[name].js',
        path: r('dist'),
        publicPath: '/public/',
        chunkFilename: 'static/js/[name].js'
    },
    resolve: {
        mainFields: ['jsnext:main', 'browser', 'main'],
        extensions: ['.jsx', '.js', '.json'],
        alias: {
            '~': r('src')
        }
    },
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
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    }
                },
                include: r('src')
            },
            {
                test: /\.(css|styl)$/,
                use: [
                    'style-loader',
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
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: r('public/index.template.html'),
            inject: true
        }),
        new HtmlWebpackPlugin({
            filename: 'server.ejs',
            template: '!!ejs-compiled-loader!' + r('public/server.template.ejs'),
            inject: true
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                isClient: 'true',
                isServer: 'false'
            }
        })
    ],
    devServer: {
        host: '0.0.0.0',
        port: 9000,
        overlay: {
            errors: true,
            warnings: false
        },
        hot: true,
        publicPath: '/public/',
        historyApiFallback: {
            rewrites: [
                { from: /^\//, to: '/public/index.html' }
            ]
        },
        open: false,
        inline: true
    }
}
