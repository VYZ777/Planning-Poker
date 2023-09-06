import { configureStore } from '@reduxjs/toolkit'
import { memorySlice } from './slice'

export const store = configureStore({
  reducer: {
    memory: memorySlice.reducer,
  },
})
