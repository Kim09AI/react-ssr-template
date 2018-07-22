import { combineReducers } from 'redux'

import post from './post'
import detail from './detail'

export default function createRootReducer() {
    return combineReducers({
        post,
        detail
    })
}
