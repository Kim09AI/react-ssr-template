import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import { AppContainer } from 'react-hot-loader' // eslint-disable-line

import createRootReducer from './reducers'
import rootSaga from './saga'
import { cacheMiddleware, resetStateMiddleware } from './utils/middleware'

import App from './app'

const initialState = window.__INITIAL_STATE__ || {} // eslint-disable-line

const sagaMiddleware = createSagaMiddleware()

const middleware = [cacheMiddleware, resetStateMiddleware, sagaMiddleware]
const store = createStore(createRootReducer(), initialState, applyMiddleware(...middleware))

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

renderApp(App)

if (module.hot) {
    module.hot.accept('./app', () => {
        const NewApp = require('./app').default // eslint-disable-line
        renderApp(NewApp)
    })
}
