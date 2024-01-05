import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import pageStore from './pageStore'
import queryStore from './queryStore'
import userStore from "./userStore";
const rootReducer = {
    page: pageStore,
    query: queryStore,
    user: userStore
}

const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
})
export default store