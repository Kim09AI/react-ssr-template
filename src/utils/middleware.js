/**
 * 每次都更新state，有reset的就先清空相应的state
 */
export const resetStateMiddleware = () => next => action => {
    if (action.reset && typeof action.reset === 'string') {
        next({
            type: action.reset
        })
    }

    next(action)
}

/**
 * 是否从缓存中取数据，可以设置forceUpdate为true强制更新（如下拉刷新）
 */
export const cacheMiddleware = store => next => action => {
    if (typeof action.cache === 'function') {
        if (!action.forceUpdate && action.cache(store.getState())) {
            process.env.NODE_ENV !== 'production' && console.log(`type = ${action.type} use cache!`) // eslint-disable-line
            return
        }
    }

    next(action)
}
