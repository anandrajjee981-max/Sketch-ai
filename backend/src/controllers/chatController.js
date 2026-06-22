import chatmodel from "../models/Chat.js";
import messagemodel from "../models/Message.js";
import { startChat, genratetitle } from "../service/ai.service.js";
import { uploadImage } from "../middleware/imageupload.js";
import chatImageModel from "../models/chatimage.js";
import mongoose from "mongoose";

export async function sendmessage(req, res) {
  try {
    // FIX: Destructure imageUrl (or whatever key you pass from frontend) from body
    const { message, chat: chatid, chatId: chatIdField, imageUrl } = req.body;
    const incomingChatId = chatid || chatIdField;
    const chatId = incomingChatId && String(incomingChatId).trim() ? incomingChatId : null;

    // Check if both message AND image are missing
    if (!message?.trim() && !imageUrl) {
      return res.status(400).json({
        message: "Either a message text or an image is required",
      });
    }

    let title = null;
    let activeChatId = chatId;

    if (activeChatId) {
      const existingChat = await chatmodel.findOne({ _id: activeChatId, user: req.user.id });
      if (!existingChat) {
        return res.status(404).json({
          message: "Chat not found",
        });
      }
    }

    // Create new chat when no existing chat was provided
    if (!activeChatId) {
      // Use fallback title if message is empty but image exists
      title = message?.trim() ? await genratetitle(message) : "Image Exploration";

      const newChat = await chatmodel.create({
        title,
        user: req.user.id,
      });

      activeChatId = newChat._id;
    }

    // FIX: Save current user message FIRST along with the structured image link
    const usermessage = await messagemodel.create({
      role: "user",
      content: message || "", 
      chat: activeChatId,
      image: imageUrl || null // Make sure your Message model supports an 'image' schema field
    });

    // Fetch conversation history
    const messages = await messagemodel
      .find({ chat: activeChatId })
      .sort({ createdAt: 1 });

    console.log("Messages sent to AI:", messages.length);

    // FIX: Consume async generator from startChat to produce the final text response.
    const responseGenerator = startChat(messages, activeChatId);
    let aiContent = "";

    try {
      for await (const chunk of responseGenerator) {
        if (chunk) {
          aiContent += chunk;
        }
      }
    } catch (genError) {
      console.error("❌ Error in AI response generator:", genError);
      throw new Error(`AI generation failed: ${genError.message}`);
    }

    const response = aiContent.trim();

    // Check if response is empty and log for debugging
    if (!response) {
      console.warn("⚠️ Warning: AI returned empty response for chat:", activeChatId);
      console.warn("Messages sent:", messages.map(m => ({role: m.role, content: m.content?.substring(0, 50)})));
      return res.status(500).json({
        message: "AI service returned empty response. Please try again.",
        error: "Empty AI response"
      });
    }

    // Save AI response
    const aimessage = await messagemodel.create({
      role: "ai",
      content: response,
      chat: activeChatId,
    });

    return res.status(200).json({
      title,
      chatId: activeChatId,
      usermessage,
      aimessage,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

export async function upload(req, res) {
  try {  
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }   
    
    // req.file.buffer aur originalname service ko pass ho rahe hain
    const imageupload = await uploadImage(req.file.buffer, req.file.originalname);
    
    const chatImage = await chatImageModel.create({
      url: imageupload.url,
      user: req.user.id,
      fileId: imageupload.fileId,
      fileTitle: imageupload.fileTitle,
    });
    
    return res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: imageupload.url, 
      chatImage
    });
  }
  catch (err) {  
    console.error("Error catch in upload controller:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });     
  }
}

export async function getchat(req, res) {
  const user = req.user.id;
  const chat = await chatmodel.find({ user: user });
  if (!chat || chat.length === 0) {
    return res.status(404).json({
      message: "no chat found"
    });
  }
  res.status(200).json({
    chat
  });
}



export async function getmessage(req, res) {
  try {
    const chatId = req.params.chat;

    // ✅ FIX 1: CastError se bachne ke liye valid ObjectId ka check lagao
    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Chat ID format provided."
      });
    }

    // Messages fetch karo sequential order mein
    const messages = await messagemodel.find({ chat: chatId }).sort({ createdAt: 1 });

    // ✅ FIX 2: Empty chat ko error mat maano, balki empty array bhejo 
    // taaki frontend `.map()` handle kar sake aur crash na ho
    if (!messages || messages.length === 0) {
      return res.status(200).json({
        success: true,
        message: [] 
      });
    }

    // Sahi response format pass karo
    return res.status(200).json({
      success: true,
      message: messages
    });

  } catch (error) {
    console.error("Error inside getmessage controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
}

export async function deletemessage(req, res) {
  try {
    const chatId = req.params.chat;

    await messagemodel.deleteMany({
      chat: chatId,
    });

    await chatmodel.findByIdAndDelete(chatId);

    return res.status(200).json({
      message: "Chat deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
}