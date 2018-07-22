import React from 'react'
import { Route } from 'react-router-dom'

/**
 * 根据路由配置生成相应路由
 * @param {array} routeConfig 路由配置
 * @param {string} parentPath 父级路由
 */
export function createRoutes(routeConfig, parentPath = '') {
    if (!routeConfig || routeConfig.length === 0) {
        return null
    }

    return (
        routeConfig.map(route => (
            <Route
                path={parentPath + route.path}
                key={parentPath + route.path}
                exact={route.exact}
                render={props => (
                    <route.component {...props}>
                        {/* 在父级路由通过 this.props.children 即可添加嵌套路由*/}
                        {createRoutes(route.routes, parentPath + route.path)}
                    </route.component>
                )}
            />
        ))
    )
}

export function createReducer(initialState, handlers) {
    return function reducer(state = initialState, action) {
        if (handlers.hasOwnProperty(action.type)) { // eslint-disable-line
            return handlers[action.type](state, action)
        }

        return state
    }
}
