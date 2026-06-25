import chatmodel from "../models/Chat.js";
import messagemodel from "../models/Message.js";
import { startChat, genratetitle } from "../service/ai.service.js";
import { uploadImage } from "../middleware/imageupload.js";
import extractTextFromPDF from '../service/rag.service.js';
import chatImageModel from "../models/chatimage.js";
import mongoose from "mongoose";

export async function sendmessage(req, res) {
  try {
    // 1. Inputs collect karein (Body aur Files dono se)
    const { message, chat: chatid, chatId: chatIdField, imageUrl } = req.body;
    const incomingChatId = chatid || chatIdField;
    const chatId = incomingChatId && String(incomingChatId).trim() ? incomingChatId : null;
    
    const file = req.file; // Multer se aane wali file

    // 2. Strict Validation: Agar na text hai, na pehle se upload ki hui image url, aur na hi koi nayi file aayi hai
    if (!message?.trim() && !imageUrl && !file) {
      return res.status(400).json({
        message: "Either a message text, an image URL, or a file upload is required.",
      });
    }

    let title = null;
    let activeChatId = chatId;

    // 3. Handle Existing Chat Session
    if (activeChatId) {
      const existingChat = await chatmodel.findOne({ _id: activeChatId, user: req.user.id });
      if (!existingChat) {
        return res.status(404).json({
          message: "Chat not found",
        });
      }
    }

    // 4. Create New Chat Session if it doesn't exist
    if (!activeChatId) {
      // Dynamic Title: Agar PDF hai toh PDF Exploration, warna default text/image title
      if (message?.trim()) {
        title = await genratetitle(message);
      } else {
        title = file?.mimetype === "application/pdf" ? "PDF Exploration" : "Image Exploration";
      }

      const newChat = await chatmodel.create({
        title,
        user: req.user.id,
      });
      activeChatId = newChat._id;
    }

    // 5. File Upload Handling (If file is uploaded via Form-Data)
    let uploadedFileDetails = null;
    let isPDF = false;

    if (file) {
      // Check karein ki file PDF hai ya image
      isPDF = file.mimetype === "application/pdf";

      // Buffer ko cloud par upload karein
      const fileUploadResult = await uploadImage(file.buffer, file.originalname);
      
      // Document model/chatImageModel mein entry karein
      uploadedFileDetails = await chatImageModel.create({
        url: fileUploadResult.url,
        user: req.user.id,
        fileId: fileUploadResult.fileId,
        fileTitle: fileUploadResult.fileTitle || file.originalname,
      });
    }

    // 6. User Message Create Karein (Dynamic Fields ke sath)
    // Jo pehle se saved image url tha ya naya file upload hua hai, sab yahan map ho jayega
    const currentFileUrl = uploadedFileDetails?.url || imageUrl || null;

    const usermessage = await messagemodel.create({
      role: "user",
      content: message || "", 
      chat: activeChatId,
      image: !isPDF ? currentFileUrl : null, // Agar image hai toh image field mein save karein
      pdf: isPDF ? currentFileUrl : null     // Agar PDF hai toh pdf field mein save karein
    });

    // 7. AI Response Generation Block
    let aiContent = "";

    if (isPDF && currentFileUrl) {
      // Workflow A: Agar PDF aayi hai, toh RAG service chalegi (Extract Text)
      try {
        const responseGenerator = await extractTextFromPDF(currentFileUrl, message || "");
        for await (const chunk of responseGenerator) {
          if (chunk) aiContent += chunk;
        }
      } catch (genError) {
        console.error("❌ Error in PDF AI response generator:", genError);
        return res.status(500).json({ message: "PDF AI generation failed", error: genError.message });
      }
    } else {
      // Workflow B: Agar normal text chat ya normal image chat hai, toh history nikal kar purana AI generator chalega
      const messagesHistory = await messagemodel.find({ chat: activeChatId }).sort({ createdAt: 1 });
      
      try {
        const responseGenerator = startChat(messagesHistory, activeChatId);
        for await (const chunk of responseGenerator) {
          if (chunk) aiContent += chunk;
        }
      } catch (genError) {
        console.error("❌ Error in standard AI response generator:", genError);
        return res.status(500).json({ message: "AI generation failed", error: genError.message });
      }
    }

    // 8. Clean AI Response Data
    let cleanedResponse = aiContent.trim();
    if (cleanedResponse.startsWith("tools")) {
      cleanedResponse = cleanedResponse.replace(/^tools\s*/, "").trim();
    }

    if (!cleanedResponse) {
      return res.status(500).json({ message: "AI service returned empty response." });
    }

    // 9. Save AI Response in Database
    const aimessage = await messagemodel.create({
      role: "ai",
      content: cleanedResponse,
      chat: activeChatId,
    });

    // 10. Unified Single JSON Response
    return res.status(200).json({
      title,
      chatId: activeChatId,
      usermessage,
      aimessage,
      chatFile: uploadedFileDetails // Agar file upload hui hogi toh details jayengi, warna null
    });

  } catch (err) {
    console.error("Critical error in merged sendmessage:", err);
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