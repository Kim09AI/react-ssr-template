import { all } from 'redux-saga/effects'
import { watchPostList } from './post'
import { watchPostDetail } from './detail'

export default function* rootSaga() {
    yield all([
        watchPostList(),
        watchPostDetail()
    ])
}
