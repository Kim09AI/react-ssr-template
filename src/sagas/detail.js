import { put, takeLatest, call } from 'redux-saga/effects'

import { getPostDetail } from '../actions/detail'
import api from '../api'
import * as types from '../types/detail'

export function* postDetailAsync(action) {
    try {
        const { id, mdrender } = action
        const { data: postDetail } = yield call(api.getTopicDetail, id, mdrender)
        yield put(getPostDetail(postDetail))
    } catch (error) {
        console.log(error)
    }
}

export function* watchPostDetail() {
    yield takeLatest(types.GET_POST_DETAIL_ASYNC, postDetailAsync)
}
