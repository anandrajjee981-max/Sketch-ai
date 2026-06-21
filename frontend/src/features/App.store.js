import { configureStore } from "@reduxjs/toolkit";
import authreducer from '../features/auth/auth.slice.js';
import chatreducer from '../features/chats/hooks/chat.slice.js'


export const store = configureStore({
  reducer: {
    auth: authreducer,
    chat : chatreducer
  }
});