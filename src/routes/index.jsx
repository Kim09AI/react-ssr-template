import React from 'react'
import { Switch, Redirect, Route } from 'react-router-dom'
import Loadable from 'react-loadable'

import { createRoutes } from '../utils/reactUtil'

/* eslint-disable */
function Loading(props) {
    if (props.error) {
        return <div>Error! <button onClick={props.retry}>Retry</button></div>
    } else if (props.pastDelay) {
        return <div>Loading...</div>
    }
    return null
}
/* eslint-enable */

const PostList = Loadable({
    loader: () => import(/* webpackChunkName: 'postList' */ '../containers/postList'),
    loading: Loading
})

const Detail = Loadable({
    loader: () => import(/* webpackChunkName: 'detail' */'../containers/detail'),
    loading: Loading
})

const routerConfig = [
    {
        path: '/postList',
        component: PostList,
        routes: []
    },
    {
        path: '/detail/:id',
        component: Detail
    }
]

export default () => (
    <Switch>
        <Route
            path="/"
            exact
            render={() => <Redirect to="/postList" />}
        />
        {
            createRoutes(routerConfig)
        }
    </Switch>
)
