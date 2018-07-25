import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import { AppContainer } from 'react-hot-loader' // eslint-disable-line
import Loadable from 'react-loadable'

import rootReducer from './reducers'
import rootSaga from './sagas'
import { cacheMiddleware, resetStateMiddleware } from './utils/middleware'
import { getMatchComponents } from './utils/reactUtil'

import App from './app'
import { routerConfig } from './routes/index'

const initialState = window.__INITIAL_STATE__ || {} // eslint-disable-line

const sagaMiddleware = createSagaMiddleware()

const middleware = [cacheMiddleware, resetStateMiddleware, sagaMiddleware]
const store = createStore(rootReducer, initialState, applyMiddleware(...middleware))

sagaMiddleware.run(rootSaga)

const renderApp = (Component) => {
    ReactDOM.hydrate(
        <AppContainer>
            <Provider store={store}>
                <Router>
                    <Component />
                </Router>
            </Provider>
        </AppContainer>,
        document.getElementById('root')
    )
}

// eslint-disable-next-line
;(async () => {
    // 预加载当前页面匹配的页面组件
    if (process.env.NODE_ENV === 'development') {
        const components = getMatchComponents(routerConfig, window.location.pathname)
        await Promise.all(components.map(component => component.preload && component.preload()))
    }

    Loadable.preloadReady().then(() => renderApp(App))
})()

if (module.hot) {
    // redux hot reload
    module.hot.accept('./reducers', () => {
        store.replaceReducer(require('./reducers').default) // eslint-disable-line
    })

    // react hot reload
    module.hot.accept('./app', () => {
        Loadable.preloadReady().then(() => {
            const NewApp = require('./app').default // eslint-disable-line
            renderApp(NewApp)
        })
    })
}
