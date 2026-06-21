import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: {
    items: [],
    current: null,
    messages: [],
  },

  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,

  reducers: {
    setChats: (state, action) => {
      state.chats.items = action.payload;
    },

    addChat: (state, action) => {
      state.chats.items.unshift(action.payload);
    },

    setCurrentChat: (state, action) => {
      state.chats.current = action.payload;
    },

    setMessages: (state, action) => {
      state.chats.messages = action.payload;
    },

    addMessage: (state, action) => {
      state.chats.messages.push(action.payload);
    },

    clearMessages: (state) => {
      state.chats.messages = [];
    },

    removeChat: (state, action) => {
      state.chats.items = state.chats.items.filter(
        chat => chat._id !== action.payload
      );

      if (state.chats.current?._id === action.payload) {
        state.chats.current = null;
        state.chats.messages = [];
      }
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setChats,
  addChat,
  setCurrentChat,
  setMessages,
  addMessage,
  clearMessages,
  removeChat,
  setLoading,
  setError,
} = chatSlice.actions;

export default chatSlice.reducer;