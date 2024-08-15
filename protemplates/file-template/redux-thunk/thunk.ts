import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'
  
const store = configureStore({
    reducer: {},
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({thunk:true})
})