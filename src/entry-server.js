import 'regenerator-runtime/runtime'
import React from 'react'
import { StaticRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'

import App from './app'
import rootReducer from './reducers'
import rootSaga from './sagas'

export default (url, routerContext, store) => (
    <Provider store={store}>
        <Router location={url} context={routerContext}>
            <App />
        </Router>
    </Provider>
)

export { rootReducer, rootSaga }
