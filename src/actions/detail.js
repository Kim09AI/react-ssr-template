import * as types from '../types/detail'

export const getPostDetailAsync = (id, mdrender) => ({
    type: types.GET_POST_DETAIL_ASYNC,
    id,
    mdrender,
    reset: types.RESET_POST_DETAIL,
    cache: state => state.detail.id === id
})

export const getPostDetail = postDetail => ({
    type: types.GET_POST_DETAIL,
    postDetail
})
