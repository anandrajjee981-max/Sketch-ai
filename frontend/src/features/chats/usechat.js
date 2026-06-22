import { useDispatch, useSelector } from "react-redux";

import { intializesocket } from "../../service/chat.socket";

import {
  setChats,
  setCurrentChat,
  setMessages,
  addMessage,
  setLoading,
  setError,
} from "./hooks/chat.slice";

import {
  sendmessage,
  getmessage,
  getchats,
  deletemessage,
  uploadimage,
} from "./service/chat.api";

export const usechat = () => {
  const dispatch = useDispatch();

  const chatState = useSelector(
    (state) => state.chat
  );







async function handleSendMessage(message, chatid, imageUrl) {
  try {
    dispatch(setLoading(true));
    
    // 1. Grab current active messages directly from your Redux store state
    const currentMessages = chatState.chats.messages || [];

    // 2. Check if this is a follow-up conversation 
    if (chatid && currentMessages.length > 0) {
      // Pass both the query string and the target chat identifier string
      const res = await sendmessage(message, chatid, imageUrl);  
      
      dispatch(addMessage(res.usermessage));
      dispatch(addMessage(res.aimessage));
      dispatch(setLoading(false));
      return res;       
    } 
    
    // 3. Fallback/Initial message context flow path if chatid is missing or new
    const res = await sendmessage(message, chatid, imageUrl);

    dispatch(addMessage(res.usermessage));
    dispatch(addMessage(res.aimessage));

    dispatch(setLoading(false));
    return res;
  } catch (err) {
    dispatch(setError(err.message));
    dispatch(setLoading(false));
    throw err;
  }
}
async function handleUploadImage(file) {
  try {
    dispatch(setLoading(true));

    const res = await uploadimage(file);

    dispatch(setLoading(false));
    return res;
  } catch (err) {
    dispatch(setError(err.message));
    dispatch(setLoading(false));
    throw err;
  }
}

  async function handleGetChats() {
    try {
      dispatch(setLoading(true));

      const res = await getchats();

      dispatch(setChats(res.chat));

      dispatch(setLoading(false));

      return res.chat;
    } catch (err) {
      dispatch(setError(err.message));
      dispatch(setLoading(false));
      throw err;
    }
  }

async function handleGetMessages(chat) {
  // 🔍 Edge Case Check: Agar chatId string 'undefined' ya khali aa rahi hai toh api hit hi mat karo
  if (!chat || chat === "undefined") {
    console.warn("handleGetMessages aborted: Invalid or undefined chat parameter received.");
    return [];
  }

  try {
    dispatch(setLoading(true));

    const res = await getmessage(chat);
    console.log("Messages response received:", res);

    // ✅ FIX 1: Safe extraction lagaya. Agar res.message nahi mila to empty array [] bhejega
    const cleanMessages = res?.message || res?.data?.message || [];

    dispatch(setMessages(cleanMessages));
    dispatch(setLoading(false));

    return cleanMessages;
  } catch (err) {
    console.error("Error in handleGetMessages workflow:", err);

    // ✅ FIX 2: Safe backend error response message nikalna
    const backendError = err.response?.data?.message || err.message || "Failed to fetch messages";
    
    dispatch(setError(backendError));
    dispatch(setLoading(false));
    
    // UI crash na ho isliye ek safe fallback empty array return kar rahe hain
    return [];
  }
}

  async function handleSelectChat(chat) {
    dispatch(setCurrentChat(chat));

    await handleGetMessages(chat._id);
  }
async function handleDeleteChat(chatId) {
  try {
    await deletemessage(chatId);

    dispatch(removeChat(chatId));
  } catch (err) {
    console.log(err);
  }
}
  return {
    intializesocket,
handleDeleteChat,
    handleSendMessage,
    handleGetChats,
    handleGetMessages,
    handleSelectChat,
    handleUploadImage,
  };
};