import { useDispatch, useSelector } from "react-redux";
import { intializesocket } from "../../service/chat.socket";

import {
  setChats,
  setCurrentChat,
  setMessages,
  addMessage,
  setLoading,
  setError,
  removeChat,
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
  const chatState = useSelector((state) => state.chat);

  // NEW UNIFIED HANDLER: Yeh plain parameters ya direct file/FormData dono accept karega
  async function handleSendMessage(message, chatid, fileOrUrl = null) {
    try {
      dispatch(setLoading(true));

      // CRITICAL FIX: Custom Multi-part Form Data Structure Build Karein
      const formData = new FormData();
      if (message) formData.append("message", message.trim());
      if (chatid) formData.append("chat", chatid);

      if (fileOrUrl) {
        if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
          // Agar direct local file object (Image/PDF) mili hai toh use 'file' key mein daalein
          formData.append("file", fileOrUrl);
        } else if (typeof fileOrUrl === "string") {
          // Agar pehle se string imageUrl hai
          formData.append("imageUrl", fileOrUrl);
        }
      }

      // Single network flow trigger karein
      const res = await sendmessage(formData);  

      // Redux custom state update block
      if (res.usermessage) dispatch(addMessage(res.usermessage));
      if (res.aimessage) dispatch(addMessage(res.aimessage));
      
      dispatch(setLoading(false));
      return res;       
    } catch (err) {
      dispatch(setError(err.message));
      dispatch(setLoading(false));
      throw err;
    }
  }

  // ⚠️ NOTE: Yeh handleUploadImage ab deprecated hai, 
  // kyunki hum handleSendMessage ke teesre parameter mein hi file bhej denge.
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
    if (!chat || chat === "undefined") {
      console.warn("handleGetMessages aborted: Invalid or undefined chat parameter received.");
      return [];
    }

    try {
      dispatch(setLoading(true));
      const res = await getmessage(chat);
      console.log("Messages response received:", res);

      const cleanMessages = res?.message || res?.data?.message || [];
      dispatch(setMessages(cleanMessages));
      dispatch(setLoading(false));
      return cleanMessages;
    } catch (err) {
      console.error("Error in handleGetMessages workflow:", err);
      const backendError = err.response?.data?.message || err.message || "Failed to fetch messages";
      dispatch(setError(backendError));
      dispatch(setLoading(false));
      return [];
    }
  }

  async function handleSelectChat(chat) {
    dispatch(setCurrentChat(chat));
    if (chat && chat._id) {
      await handleGetMessages(chat._id);
    }
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
    handleUploadImage, // Backward compatibility ke liye rakha hai
  };
};