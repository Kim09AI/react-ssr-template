import React from 'react'
import Loadable from 'react-loadable'

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

let PostList
let Detail

// 做路由懒加载时会打包出多份bundle，在development模式下打包node端运行的代码
// 由于是打包在内存中，会出现找不到模块的问题，可以考虑打包到硬盘但是这样显然效率较低
// 所以这里就单独为开发时打包服务端渲染bundle，提供一份同步的路由
if (process.env.isServer && process.env.NODE_ENV === 'development') {
    /* eslint-disable */
    PostList = require('../containers/postList').default
    Detail = require('../containers/detail').default
    /* eslint-enable */
} else {
    PostList = Loadable({
        loader: () => import(/* webpackChunkName: 'postList' */ '../containers/postList'),
        loading: Loading
    })

    Detail = Loadable({
        loader: () => import(/* webpackChunkName: 'detail' */ '../containers/detail'),
        loading: Loading
    })
}

export default {
    PostList,
    Detail
}
