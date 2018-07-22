import React from 'react'
import { Link } from 'react-router-dom'

import Routes from './routes'

export default () => (
    <div>
        <nav>
            <Link to="/postList">postList</Link>
        </nav>
        <Routes />
    </div>
)
