import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
  
const sagaMiddleware = createSagaMiddleware()
const saga = [sagaMiddleware]
  
const store = configureStore({
      reducer: {},
      middleware: [saga]
})