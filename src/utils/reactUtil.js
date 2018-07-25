import React from 'react'
import { Route, matchPath } from 'react-router-dom'

/**
 * example
 * [
 *      {
 *          path: '/postList',
 *          component: PostList,
 *          // 放置嵌套路由
 *          routes: [
 *              {
 *                  // 会自动拼接路径，此处为 /postList/test
 *                  path: '/test',
 *                  component: Test,
 *                  exact: false
 *              }
 *          ]
 *      }
 * ]
 * 根据路由配置生成相应路由
 * @param {array} routeConfig 路由配置
 * @param {string} parentPath 父级路由的path
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

/**
 * 辅助创建reducer
 * @param {any} initialState 初始值
 * @param {object} handlers 包含reducer处理函数的对象
 */
export function createReducer(initialState, handlers) {
    return function reducer(state = initialState, action) {
        if (handlers.hasOwnProperty(action.type)) { // eslint-disable-line
            return handlers[action.type](state, action)
        }

        return state
    }
}

/**
 * 获取匹配pathname的组件列表
 * @param {array} routes 路由配置
 * @param {string} pathname url的pathname
 * @param {string} parentPath 父级路由的path
 */
export function getMatchComponents(routes, pathname, parentPath = '') {
    const components = []

    routes.some(route => {
        const result = matchPath(pathname, {
            ...route,
            path: parentPath + route.path
        })

        if (result !== null) {
            components.push(route.component)
            route.routes && components.push(...getMatchComponents(route.routes, pathname, parentPath + route.path))
            return true
        }

        return false
    })

    return components
}
