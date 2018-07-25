# react-ssr-demo
>前言：一个简单易用、可拓展的、基于当前最新的react（16.4.1）、react-router（4.3.1）、redux（4.0.0）、redux-sage（0.16.0）、webpack（4.16.1）、express等搭建的react服务端渲染模板，除了一些基础的功能之外，还对一些服务端渲染中可以遇到或要解决的问题，做了一定的封装，使用起来更加方便，里面提供了两个页面供演示用，下面会详细讲解如何使用，并且这个项目也会一直维护更新，当然也会厚着脸皮要个star，欢迎star或fork、PR，有任何问题也都可以欢迎来提issues，一起来完善这个项目！！！

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
- [服务端渲染数据预取](#1)
- [设置title及meta](#2)
- [环境区分](#3)
- [如何防止再次获取服务端渲染预取的数据](#4)
- [数据存在全局state中的问题](#5)
- [登录后刷新页面，如何同步状态](#6)
- [路由懒加载的一些问题](#7)
- [目录结构](#10)
- [最后](#end)

### 服务端渲染数据预取
在容器组件中添加一个`bootstrap`的方法，在里面放置数据获取的代码，服务端渲染时会自动调用，该方法可以返回一个`promise`，以下2种方式都可以
```js
bootstrap() {
    this.getPostDetailAsync()
}

bootstrap() {
    return axios.get('/url')
}
```
既然页面初始化的数据可以通过组件的`bootstrap`方法去获取数据，那回到浏览器这边也是可以的，所以对于页面初始数据的获取，不管在浏览器还是服务端，都不需要手动调用，只要定义好即可，在浏览器这边我写了一个`高阶组件`去统一调用的，具体代码下面会看到

### 设置title及meta
设置title及meta是通过`react-helmet`来设置的，导入后在`render`函数中设置
```js
import Helmet from 'react-helmet'

<Helmet>
    <title>{detail.title}</title>
    <meta name="keywords" content="HTML,ASP,PHP,SQL" />
</Helmet>
```

### 环境区分
通过判断`process.env.isClient`或`process.env.isServer`区分

### 如何防止再次获取服务端渲染预取的数据
对于服务端渲染预取的数据，回到浏览器时肯定是不需要获取的，在思考这个问题的时候，也参考过几个模板的处理方法，总感觉不够方便，多少和业务代码耦合了，还要一个一个处理，使用不方便，也想过通过去记录`action`或通过`url`匹配组件的方式，最后都行不通，最后的最后总算是让我找到一个感觉不错的方法，只需要在容器组件添加一行即可`@autoFetch`，不过添加的位置是有限制的，比如要添加`@connect()`和`@autoFetch`到`Component`，那顺序只能是`@connect() @autoFetch Component`，这个跟我的实现方式有关，而解决再次获取服务端渲染预取的数据的问题，主要是利用了组件的`生命周期执行顺序`，代码如下
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

        componentDidMount() {
            window.__INITIAL_URL__ && delete window.__INITIAL_URL__ // eslint-disable-line
            typeof super.componentDidMount === 'function' && super.componentDidMount()
        }
    }

    return AutoFetchComponent
}
```
浏览器的页面初始数据就是在`componentWillMount`中统一获取的，`window.__INITIAL_URL__`是服务端渲染时的`url`(详细可查看`server/ssr/render.js`)，在页面刷新的时候，`window.__INITIAL_URL__`是当前服务端渲染时的`url`，然后`componentWillMount`的时候发现存在`window.__INITIAL_URL__`就不在获取初始数据了，然后`componentDidMount`就删掉`window.__INITIAL_URL__`，接下来在浏览器这边的路由跳转就可以正常获取数据了，这是很显然的，那对于嵌套路由是否也可以呢？答案也是可以的，比如页面A里面有一个嵌套路由B，两个页面都添加了`@autoFetch`，生命周期会是以下执行顺序，A页面`componentWillMount` => A页面`render` => B页面`componentWillMount` => B页面`render` => B页面`componentDidMount` => A页面`componentDidMount`，基于这样的生命周期执行顺序，在第一次`componentDidMount`时，所有页面级组件的`componentWillMount`都已执行，就可以利用`window.__INITIAL_URL__`绕过数据获取了，`componentDidMount`之后清除`window.__INITIAL_URL__`，接下来的路由跳转就会自动获取数据了

### 目录结构
```js
├─.babelrc
├─.editorconfig
├─.eslintrc     # eslint配置文件
├─nodemon.json
├─package.json
├─README.md
├─yarn.lock
├─src
|  ├─.eslintrc  # eslint配置文件
|  ├─app.jsx    # 同构的根组件
|  ├─entry-client.js    # 客户端入口
|  ├─entry-server.js    # 服务端渲染入口
|  ├─utils
|  |   ├─decorators.js
|  |   ├─middleware.js
|  |   └reactUtil.js
|  ├─types      # 存放action type
|  |   ├─detail.js  # 演示用
|  |   └post.js     # 演示用
|  ├─sagas      # 存放saga
|  |   ├─detail.js     # 演示用
|  |   ├─index.js
|  |   └post.js        # 演示用
|  ├─routes
|  |   ├─index.jsx     # 路由配置
|  |   └routerComponents.jsx    # 路由组件合集
|  ├─reducers
|  |    ├─detail.js     # 演示用
|  |    ├─index.js
|  |    └post.js        # 演示用
|  ├─containers
|  |     ├─postList     # 演示用
|  |     |    ├─index.jsx
|  |     |    └style.css
|  |     ├─detail       # 演示用
|  |     |   ├─index.jsx
|  |     |   └style.styl
|  ├─assets
|  |   ├─img
|  |   |  ├─react.png
|  |   |  └vue.png
|  ├─api    # 存放api请求
|  |  └index.js
|  ├─actions    # 存放action
|  |    ├─detail.js    # 演示用
|  |    └post.js       # 演示用
├─server    # node代码
|   ├─index.js
|   ├─ssr
|   |  ├─devRender.js   # 开发环境的服务端渲染
|   |  ├─prodRender.js  # 生产环境的服务端渲染
|   |  └render.js       # 通用的render
├─public    # 静态资源目录，不经webpack处理，打包后会copy到dist根目录，访问地址如: /favicon.ico
|   ├─favicon.ico
|   ├─index.template.html
|   └server.template.ejs    # 服务端渲染模板
├─build     # webpack构建目录
|   ├─config.js     # 配置文件
|   ├─webpack.conf.base.js     # 提取出的公共webpack配置
|   ├─webpack.conf.client.dev.js
|   ├─webpack.conf.client.js
|   ├─webpack.conf.client.prod.js
|   └webpack.conf.server.js    # 服务端渲染webpack配置

```

### 最后
能够这样从零搭建一个react ssr模板，得感谢`Jokcy`老师，老师的这门课程对我帮助很大，感兴趣的同学可以点击此处购买，最后帮老师做个广告！
