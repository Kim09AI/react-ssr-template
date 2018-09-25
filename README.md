# react-ssr-template
>前言：在学习完`Jokcy`老师的[这门课程][2]后，打算搭建一个自己的服务端渲染模板，课程中状态管理选择的是`mobx`，而我比较熟悉的是`redux`，就选择了`redux`搭配`redux-saga`来进行构建，基于当前最新的react（16.4.1）、react-router（4.3.1）、redux（4.0.0）、redux-saga（0.16.0）、webpack（4.16.1）、express等构建react服务端渲染模板，后来在使用过程中觉得`redux-saga`过于繁琐，已废弃！

## 运行
```
git clone git@github.com:Kim09AI/react-ssr-template.git
cd react-ssr-template
yarn or npm install

# development
npm run dev:client
npm run dev:server
# 访问http://localhost:3000

# production
npm run build
npm start
# 访问http://localhost:3000
```

## 特性
- react及redux的hot reload
- 区分环境
- 设置title及meta
- 路由懒加载（支持服务端渲染）
- eslint规范代码（airbnb）
- 内置css|stylus，支持css modules（默认启用）
- 使用pre-commit规范提交的代码

## 目录
- [服务端渲染数据预取](#服务端渲染数据预取)
- [设置title及meta](#设置title及meta)
- [环境区分](#环境区分)
- [cssmodules](#cssmodules)
- [如何防止再次获取服务端渲染预取的数据](#如何防止再次获取服务端渲染预取的数据)
- [数据存在全局state中的问题](#数据存在全局state中的问题)
- [登录后刷新页面如何同步状态](#登录后刷新页面如何同步状态)
- [路由懒加载的一些问题](#路由懒加载的一些问题)
- [存在的问题](#存在的问题)
- [目录结构](#目录结构)
- [总结](#总结)

## 服务端渲染数据预取
在容器组件中添加一个`bootstrap`的方法，在里面放置数据获取的代码，服务端渲染时会自动调用，可以在该方法内部返回一个`promise`（可选），以下2种方式都可以
```js
bootstrap() {
    this.getPostDetailAsync()
}

bootstrap() {
    return axios.get('/url')
}
```
既然页面初始化的数据可以通过组件的`bootstrap`方法去获取数据，那回到浏览器这边也是可以的，所以对于页面初始数据的获取，不管在浏览器还是服务端，都不需要手动调用，只要定义好即可，在浏览器这边我写了一个`高阶组件`去统一调用的，具体代码下面会看到

## 设置title及meta
设置title及meta是通过`react-helmet`来设置的，导入后在`render`函数中设置
```js
import Helmet from 'react-helmet'

<Helmet>
    <title>{detail.title}</title>
    <meta name="keywords" content="HTML,ASP,PHP,SQL" />
</Helmet>
```

## 环境区分
通过判断`process.env.isClient`或`process.env.isServer`区分

## cssmodules
基于`react-css-modules`的`css modules`，只支持`css`和`stylus`，只需`import`，以及用`styleName`替换`className`，对于全局的样式，使用`className`即可
```js
import './style.styl'

<div styleName="test"></div>
```

## 如何防止再次获取服务端渲染预取的数据
对于服务端渲染预取的数据，回到浏览器时是不需要再次获取的，在容器组件添加一行即可`@autoFetch`，不过添加的位置是有限制的，比如要添加`@connect()`和`@autoFetch`到`Component`，那顺序只能是`@connect() @autoFetch Component`，这个跟我的实现方式有关，而解决再次获取服务端渲染预取的数据的问题，主要是利用了组件的`生命周期执行顺序`，代码如下
```js
export const autoFetch = Component => {
    class AutoFetchComponent extends Component {
        componentWillMount() {
            // eslint-disable-next-line
            if (process.env.isClient && !window.__INITIAL_URL__) {
                typeof super.bootstrap === 'function' && super.bootstrap()
            }
            typeof super.componentWillMount === 'function' && super.componentWillMount()
        }
    }

    return AutoFetchComponent
}

// 根组件
export default class App extends React.Component {
    componentDidMount() {
        // 首屏渲染完成后删除 __INITIAL_URL__
        // 接下来的页面初始数据获取就会自动获取
        window.__INITIAL_URL__ && delete window.__INITIAL_URL__ // eslint-disable-line
    }
}
```
浏览器的页面初始数据就是在`componentWillMount`中统一获取的，`window.__INITIAL_URL__`是服务端渲染时的`url`(详细可查看`server/ssr/render.js`)，在页面刷新的时候，`window.__INITIAL_URL__`是当前服务端渲染时的`url`，然后`componentWillMount`的时候发现存在`window.__INITIAL_URL__`就不在获取初始数据了，然后`componentDidMount`就删掉`window.__INITIAL_URL__`，并且生命周期执行顺序如下
 1. 父组件componentWillMount
 2. 父组件render
 3. 子组件componentWillMount
 4. 子组件render
 5. 子组件componentDidMount
 6. 父组件componentDidMount
 基于这样的生命周期执行顺序，在根组件`componentDidMount`时，所有组件的`componentWillMount`都已执行，就可以利用`window.__INITIAL_URL__`绕过数据获取了，`componentDidMount`之后清除`window.__INITIAL_URL__`，接下来的路由跳转就会自动获取数据了

## 数据存在全局state中的问题
在没有服务端渲染时，把数据存在`store`的`state`中，可能是因为我们的数据需要共享或需要缓存，而服务端渲染时同步预取数据需要借助`redux`，导致一些适合放在组件`state`的数据也都放到了全局`state`，这样就会难免增加一些额外的判断，不加的话可能就会遇到这种情况，比如一个文章详情页，先点了一片文章然后返回，再点进另一篇文章时，就会先看到之前的文章，等ajax完成之后才看到当前文章，显然体验不够友好，针对这些问题，自己写了两个中间件`cacheMiddleware`和`resetStateMiddleware`，只需修改`action`即可
```js
export const getData = (forceUpdate) => ({
    type: types.GET_POST_DETAIL_ASYNC,
    reset: types.RESET_POST_DETAIL, // 放一个action type，作为真正获取数据的type前，先执行清理/reset
    cache: state => state.detail.id === id // 指定是否需要缓存，接受全局state作为参数,
    forceUpdate: true // 即使存在cache，也可以设置该项，忽略cache的结果，强制更新
})
```

## 登录后刷新页面如何同步状态
在登录后刷新页面，显然是需要记住登录状态以及一些用户信息的，对于如何同步这些状态，可以考虑在`src/app.jsx`中添加一个`bootstrap`或在`server/ssr/render.js`中同步，这里只是指出两个可能可以实现这一功能的地方

## 路由懒加载的一些问题
要使用路由懒加载的功能，同时还支持服务端渲染，[react-loadable][1]是一个不错的选择，基本按照文档step by step，就可以搭建好在`production`模式下的路由懒加载，但是在`development`模式下做服务端渲染时，却发现会出现找不到模块的错误，通过对比两个环境下的差异，很容易发现是因为一个打包在本地文件一个是打包在内存，而打包在内存中没法直接`require`，那这样的话开发时也打包到本地不就行了，但是这样显然效率低下，于是就有了接下来的方法，再提供一份同步加载的组件，用于服务端渲染，这样所有js都打包到了一个文件，也就绕过了`require`
```js
if (process.env.isServer && process.env.NODE_ENV === 'development') {
    /* eslint-disable */
    PostList = require('../containers/postList').default
    /* eslint-enable */
} else {
    PostList = Loadable({
        loader: () => import(/* webpackChunkName: 'postList' */ '../containers/postList'),
        loading: Loading
    })
}
```
这样的话，对于需要懒加载的组件，就需要提供同时一个同步版本和一个异步版本，那这样就行了吗？刷新页面，发现服务端渲染正常，却发现报错说服务端渲染和客户端渲染结果不匹配，那是因为客户端渲染的时候，页面懒加载需要加载的`js`还没加载好导致的，所以在客户端渲染前，需要先加载好该页面需要的`js`，代码如下
```js
;(async () => {
    // 预加载当前页面匹配的页面组件
    if (process.env.NODE_ENV === 'development') {
        const components = getMatchComponents(routerConfig, window.location.pathname)
        await Promise.all(components.map(component => component.preload && component.preload()))
    }

    Loadable.preloadReady().then(() => renderApp(App))
})()
```

## 存在的问题
`cookie`的共享问题，有解决的方法但是使用起来不方便

## 总结
学习完课程后，通过自己去从零搭建服务端渲染的工程，更加巩固的学到的知识，加深了对react服务端渲染的理解，搭建过程中也遇到了一些问题，在思考及解决某些问题的过程中也算有所提升，帮助自己在接下来可以搭建一个更加完善的服务端渲染模板


  [1]: https://github.com/jamiebuilds/react-loadable
  [2]: https://coding.imooc.com/class/161.html
