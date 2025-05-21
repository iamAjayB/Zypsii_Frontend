import { configureStore } from '@reduxjs/toolkit';
import storiesReducer from './reducers/storiesReducer';
import scheduleReducer from './slices/scheduleSlice';

const store = configureStore({
  reducer: {
    stories: storiesReducer,
    schedule: scheduleReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export { store }; 