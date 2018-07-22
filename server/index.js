require('babel-polyfill') // 在node环境中可以运行结果webpack打包过的decorators
const express = require('express')
const path = require('path')

const app = express()

const isDev = process.env.NODE_ENV === 'development'

if (isDev) {
    app.use('/public', require('http-proxy-middleware')({
        target: 'http://localhost:9000',
        changeOrigin: true
    }))

    const devRender = require('./ssr/devRender')
    app.get('*', (req, res, next) => {
        devRender(req, res, next)
    })
} else {
    app.use(express.static(path.resolve(__dirname, '../dist')))

    const prodRender = require('./ssr/prodRender')
    app.get('*', (req, res, next) => {
        prodRender(req, res, next)
    })
}

app.use((req, res, next) => {
    const err = new Error(req.originalUrl + 'Not Found')
    err.status = 404
    next(err)
})

app.use((err, req, res, next) => {
    const status = err.status || 500
    res.status(status).send(err.message)
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`server running on http://localhost:${port}`))
