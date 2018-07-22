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
        const { default: createApp, cacheMiddleware, resetStateMiddleware, createRootReducer, rootSaga } = serverBundle
        const { createStore, applyMiddleware } = redux
        const { default: createSagaMiddleware, END } = saga
        const sagaMiddleware = createSagaMiddleware()
        const middleware = [cacheMiddleware, resetStateMiddleware, sagaMiddleware]
        const store = createStore(createRootReducer(), applyMiddleware(...middleware))
        const sagaTask = sagaMiddleware.run(rootSaga)
        const app = createApp(req.url, routerContext, store)

        await bootstrapper(app)

        if (routerContext.url) {
            res.writeHead(302, {
                Location: routerContext.url
            })
            res.end()
            return
        }

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
            initialUrl: `"${req.url}"`
        })
        res.send(html)
    } catch (error) {
        next(error)
    }
}
