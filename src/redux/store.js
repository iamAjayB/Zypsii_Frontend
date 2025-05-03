import { configureStore } from '@reduxjs/toolkit';
import scheduleReducer from './slices/scheduleSlice';

export const store = configureStore({
  reducer: {
    schedule: scheduleReducer,
  },
}); 