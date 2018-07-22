import { createReducer } from '../utils/reactUtil'
import * as types from '../types/detail'

const initialState = {}

export default createReducer(initialState, {
    [types.GET_POST_DETAIL](state, action) {
        return {
            ...action.postDetail
        }
    },
    [types.RESET_POST_DETAIL]() {
        return initialState
    }
})
