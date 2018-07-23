import * as types from '../types/post'

export const getPostListAsync = (page, tab, limit, mdrender) => ({
    type: types.GET_POST_LIST_ASYNC,
    page,
    tab,
    limit,
    mdrender,
    // reset: types.RESET_POST_LIST
})

export const getPostList = postList => ({
    type: types.GET_POST_LIST,
    postList
})
