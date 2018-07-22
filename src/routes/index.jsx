import React from 'react'
import { Switch, Redirect, Route } from 'react-router-dom'

import { createRoutes } from '../utils/reactUtil'
import PostList from '../containers/postList'
import Detail from '../containers/detail'

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
