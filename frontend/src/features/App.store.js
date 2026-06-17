import { configureStore } from "@reduxjs/toolkit";
import authreducer from '../features/auth/auth.slice.js';


export const store = configureStore({
  reducer: {
    auth: authreducer
  }
});