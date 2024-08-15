import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
  
const sagaMiddleware = createSagaMiddleware()
  
const store = configureStore({
      reducer: {},
      middleware: (gDM) => gDM().concat(sagaMiddleware)
})