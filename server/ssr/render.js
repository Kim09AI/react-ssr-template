const ReactDOMServer = require('react-dom/server')
const ejs = require('ejs')
const bootstrapper = require('react-async-bootstrapper')
const Helmet = require('react-helmet').Helmet
const redux = require('redux')
const saga = require('redux-saga')
const serialize = require('serialize-javascript')
const getBundles = require('react-loadable/webpack').getBundles

module.exports = async (template, serverBundle, req, res, next, stats) => {
    try {
        let modules = []
        const routerContext = {}
        const { default: createApp, rootReducer, rootSaga } = serverBundle
        const { createStore, applyMiddleware } = redux
        const { default: createSagaMiddleware, END } = saga
        const sagaMiddleware = createSagaMiddleware()
        const store = createStore(rootReducer, applyMiddleware(sagaMiddleware))
        const sagaTask = sagaMiddleware.run(rootSaga)
        const app = createApp(req.url, routerContext, store, modules)

        // 此处可以考虑同步一些数据，比如在用户登录的情况下同步登录状态

        // 调用组件的bootstrap获取数据
        await bootstrapper(app)

        if (routerContext.url) {
            res.writeHead(302, {
                Location: routerContext.url
            })
            res.end()
            return
        }

        // dispatch的action都完成后停止saga
        store.dispatch(END)
        await sagaTask.done

        const appString = ReactDOMServer.renderToString(app)
        const helmet = Helmet.renderStatic()

        if (stats) {
            const bundles = getBundles(stats, modules)

            // 对懒加载的组件进行过滤去重
            const cssBundles = bundles
                .filter(bundle => bundle.publicPath.endsWith('.css'))
                .reduce((result, bundle) => {
                    result.indexOf(bundle.publicPath) === -1 && result.push(bundle.publicPath)
                    return result
                }, [])
                .map(publicPath => `<link rel="stylesheet" type="text/css" href="${publicPath}">`).join('')
            const bundleScripts = bundles
                .filter(bundle => bundle.publicPath.endsWith('.js'))
                .reduce((result, bundle) => {
                    result.indexOf(bundle.publicPath) === -1 && result.push(bundle.publicPath)
                    return result
                }, [])
                .map(publicPath => `<script src="${publicPath}"></script>`).join('')

            // 把懒加载的资源添加到模板中
            template = template
                .replace(/(<\/head>)/, `${cssBundles}$1`)
                .replace(/(<script[^>]+app\.[\d\w]+\.js[^>]?><\/script>)/, `${bundleScripts}$1`)
        }

        const html = ejs.render(template, {
            appString,
            meta: helmet.meta.toString(),
            link: helmet.link.toString(),
            style: helmet.style.toString(),
            title: helmet.title.toString(),
            initalState: serialize(store.getState()),
            // 标记服务端渲染页面的地址，在浏览器时用来阻止再次获取服务端渲染预取的数据
            initialUrl: `"${req.url}"`
        })
        res.send(html)
    } catch (error) {
        next(error)
    }
}
