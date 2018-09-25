import { put, takeLatest, call } from 'redux-saga/effects'

import { getPostList } from '../actions/post'
import * as types from '../types/post'
import api from '../api'

export function* postListAsync(action) {
    try {
        const { page, tab, limit, mdrender } = action
        const { data: postList } = yield call(api.getTopics, page, tab, limit, mdrender)
        yield put(getPostList(postList))
    } catch (error) {
        console.log(error)
    }
}

export function* watchPostList() {
    yield takeLatest(types.GET_POST_LIST_ASYNC, postListAsync)
}
