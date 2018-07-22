import React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { getPostListAsync } from '../../actions/post'
import { autoFetchData } from '../../utils/decorators'
import './style.css'
import vueLogo from '../../assets/img/vue.png'
import reactLogo from '../../assets/img/react.png'

const mapStateToProps = state => ({
    post: state.post
})

@connect(mapStateToProps, { getPostListAsync })
@autoFetchData
export default class PostList extends React.Component {
    static propTypes = {
        getPostListAsync: PropTypes.func.isRequired,
        post: PropTypes.array.isRequired,
        history: PropTypes.object.isRequired
    }

    handleClick(id) {
        this.props.history.push(`/detail/${id}`)
    }

    bootstrap() {
        // const page = (Math.random() * 5) + 1
        this.props.getPostListAsync(1)
    }

    render() {
        const { post } = this.props

        return (
            <div>
                <Helmet>
                    <title>postList</title>
                    <meta name="keywords" content="list" />
                </Helmet>
                <div styleName="logo-wrapper">
                    <img styleName="logo" src={vueLogo} alt="" />
                    <img styleName="logo" src={reactLogo} alt="" />
                </div>
                <ul styleName="list">
                    {
                        post.map(item => (
                            <div
                                styleName="item"
                                key={item.id}
                                onClick={() => this.handleClick(item.id)}
                            >
                                {item.title}
                            </div>
                        ))
                    }
                </ul>
            </div>
        )
    }
}
