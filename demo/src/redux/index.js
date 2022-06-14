import {configureStore} from "@reduxjs/toolkit";
import mainScreenReducer from './mainScreenReducer'

const store = configureStore({
    reducer: mainScreenReducer
})

export default store