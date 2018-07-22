import { createReducer } from '../utils/reactUtil'
import * as types from '../types/post'

const initialState = []

export default createReducer(initialState, {
    [types.GET_POST_LIST](state, action) {
        return [
            ...action.postList
        ]
    },
    [types.RESET_POST_LIST]() {
        return initialState
    }
})
