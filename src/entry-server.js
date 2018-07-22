import React from 'react'
import { StaticRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'

import App from './app'
import { cacheMiddleware, resetStateMiddleware } from './utils/middleware'
import rootReducer from './reducers'
import rootSaga from './saga'

export default (url, routerContext, store) => (
    <Provider store={store}>
        <Router location={url} context={routerContext}>
            <App />
        </Router>
    </Provider>
)

export { cacheMiddleware, resetStateMiddleware, rootReducer, rootSaga }
