import React from 'react'
import { Link } from 'react-router-dom'

import Routes from './routes'

export default class App extends React.Component {
    componentDidMount() {
        // 首屏渲染完成后删除 __INITIAL_URL__
        // 接下来的页面初始数据获取就会自动获取
        window.__INITIAL_URL__ && delete window.__INITIAL_URL__ // eslint-disable-line
    }

    render() {
        return (
            <div>
                <nav>
                    <Link to="/postList">postList</Link>
                </nav>
                <Routes />
            </div>
        )
    }
}
