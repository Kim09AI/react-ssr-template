const ReactDOMServer = require('react-dom/server')
const ejs = require('ejs')
const bootstrapper = require('react-async-bootstrapper')
const Helmet = require('react-helmet').Helmet
const redux = require('redux')
const saga = require('redux-saga')
const serialize = require('serialize-javascript')

module.exports = async (template, serverBundle, req, res, next) => {
    try {
        const routerContext = {}
        const { default: createApp, cacheMiddleware, resetStateMiddleware, rootReducer, rootSaga } = serverBundle
        const { createStore, applyMiddleware } = redux
        const { default: createSagaMiddleware, END } = saga
        const sagaMiddleware = createSagaMiddleware()
        const middleware = [cacheMiddleware, resetStateMiddleware, sagaMiddleware]
        const store = createStore(rootReducer, applyMiddleware(...middleware))
        const sagaTask = sagaMiddleware.run(rootSaga)
        const app = createApp(req.url, routerContext, store)

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

        const helmet = Helmet.renderStatic()
        const appString = ReactDOMServer.renderToString(app)

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
