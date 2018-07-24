import 'regenerator-runtime/runtime'
import React from 'react'
import { StaticRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import Loadable from 'react-loadable'

import App from './app'
import rootReducer from './reducers'
import rootSaga from './sagas'

export default (url, routerContext, store, modules) => (
    <Loadable.Capture report={moduleName => modules.push(moduleName)}>
        <Provider store={store}>
            <Router location={url} context={routerContext}>
                <App />
            </Router>
        </Provider>
    </Loadable.Capture>
)

export { rootReducer, rootSaga }
