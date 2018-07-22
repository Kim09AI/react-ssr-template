import React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { getPostDetailAsync } from '../../actions/detail'
import { autoFetchData } from '../../utils/decorators'
import './style.styl'

const mapStateToProps = state => ({
    detail: state.detail
})

@connect(mapStateToProps, { getPostDetailAsync })
@autoFetchData
export default class Detail extends React.Component {
    static propTypes = {
        getPostDetailAsync: PropTypes.func.isRequired,
        detail: PropTypes.object.isRequired,
        match: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    getPostDetailAsync() {
        const { id } = this.props.match.params
        this.props.getPostDetailAsync(id)
    }

    goBack() {
        this.props.history.goBack()
    }

    bootstrap() {
        this.getPostDetailAsync()
    }

    render() {
        const { detail } = this.props

        return (
            <div>
                <Helmet>
                    <title>detail</title>
                    <meta name="keywords" content="HTML,ASP,PHP,SQL" />
                </Helmet>
                <div onClick={() => this.goBack()} style={{ cursor: 'pointer' }}>返回</div>
                <div styleName="wrapper">
                    <h3 styleName="title">{detail.title}</h3>
                    <div styleName="info">{detail.author ? detail.author.loginname : null} -- {detail.create_at}</div>
                    <div styleName="content" dangerouslySetInnerHTML={{ __html: detail.content }} />
                </div>
            </div>
        )
    }
}
