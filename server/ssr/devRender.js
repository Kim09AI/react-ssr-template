const webpack = require('webpack')
const path = require('path')
const MFS = require('memory-fs')
const vm = require('vm')
const NativeModule = require('module')
const axios = require('axios')
const render = require('./render')
const serverConfig = require('../../build/webpack.conf.server')

const getTemplate = () => {
    return new Promise((resolve, reject) => {
        axios.get('http://localhost:9000/public/server.ejs')
            .then(res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

let serverBundle
const complier = webpack(serverConfig)
const mfs = new MFS()
complier.outputFileSystem = mfs
complier.watch({}, (err, stats) => {
    if (err) throw err
    stats = stats.toJson()
    stats.errors.forEach(err => console.error(err))
    stats.warnings.forEach(warn => console.warn(warn))

    let bundlePath = path.resolve(serverConfig.output.path, serverConfig.output.filename)
    let bundle = mfs.readFileSync(bundlePath, 'utf-8')

    const m = { exports: {} }
    const wrap = NativeModule.wrap(bundle)
    const script = new vm.Script(wrap, {
        displayErrors: true,
        filename: 'server.bundle.js'
    })
    const result = script.runInThisContext()
    result.call(m.exports, m.exports, require, m)
    serverBundle = m.exports
})

module.exports = function devRender(req, res, next) {
    if (!serverBundle) {
        return res.send('waiting for compile, refresh later!')
    }
    getTemplate()
        .then(template => {
            render(template, serverBundle, req, res, next)
        })
        .catch(next)
}
