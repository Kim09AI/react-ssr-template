module.exports = {
    common: {
        // 是否启用css modules
        cssModules: true
    },
    dev: {
        // 修改后需要同步修改这里
        // app.use('/public', require('http-proxy-middleware')({
        //     target: 'http://localhost:9000',
        //     changeOrigin: true
        // }))
        publicPath: '/public/'
    },
    prod: {
        publicPath: '/'
    }
}
