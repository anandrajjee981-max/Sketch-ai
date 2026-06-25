import chatmodel from "../models/Chat.js";
import messagemodel from "../models/Message.js";
import { startChat, genratetitle } from "../service/ai.service.js";
import { uploadImage } from "../middleware/imageupload.js";
import extractTextFromPDF from '../service/rag.service.js';
import chatImageModel from "../models/chatimage.js";
import mongoose from "mongoose";

export async function sendmessage(req, res) {
  try {
    // 1. Inputs collect karein 
    const { message, chat: chatid, chatId: chatIdField, imageUrl } = req.body;
    
    const incomingChatId = chatid || chatIdField;
    const chatId = incomingChatId && 
                   String(incomingChatId).trim() !== "" && 
                   String(incomingChatId) !== "undefined" 
                   ? incomingChatId : null;
    
    const file = req.file; 

    if (file) {
      console.log("📁 Multer File Intercepted:", file.originalname, "Size:", file.size);
    }

    // 2. Strict Payload Validation
    if (!message?.trim() && !imageUrl && !file) {
      return res.status(400).json({
        message: "Either a message text, an image URL, or a file upload is required.",
      });
    }

    let title = null;
    let activeChatId = chatId;

    // 3. Verify Existing Chat Session
    if (activeChatId) {
      try {
        const existingChat = await chatmodel.findOne({ _id: activeChatId, user: req.user.id });
        if (!existingChat) {
          return res.status(404).json({ message: "Chat session not found" });
        }
      } catch (dbErr) {
        console.error("❌ Mongoose Valid Chat Fetch Cast Error:", dbErr.message);
        activeChatId = null; // Fallback to creating a new chat instead of throwing 500
      }
    }

    // 4. Create New Chat Session if required
    if (!activeChatId) {
      if (message?.trim()) {
        try {
          // Dynamic safety fallback for title generation
          title = typeof genratetitle === 'function' ? await genratetitle(message) : "New Conversation";
        } catch (titleErr) {
          console.error("⚠️ Title generation failed, using fallback:", titleErr.message);
          title = "New Conversation";
        }
      } else {
        title = file?.mimetype === "application/pdf" ? "PDF Exploration" : "Image Exploration";
      }

      const newChat = await chatmodel.create({
        title,
        user: req.user.id,
      });
      activeChatId = newChat._id;
    }

    // 5. File Upload Handling via ImageKit
    let uploadedFileDetails = null;
    let isPDF = false;

    if (file && file.buffer) {
      isPDF = file.mimetype === "application/pdf";

      try {
        const fileUploadResult = await uploadImage(file.buffer, file.originalname);
        console.log("☁️ ImageKit Upload Success:", fileUploadResult.url);

        uploadedFileDetails = await chatImageModel.create({
          url: fileUploadResult.url,
          user: req.user.id,
          fileId: fileUploadResult.fileId,
          fileTitle: fileUploadResult.fileTitle || file.originalname,
        });
      } catch (uploadErr) {
        console.error("❌ ImageKit Core SDK Handler Crash:", uploadErr.message);
        return res.status(500).json({ message: "Cloud asset transmission failed", error: uploadErr.message });
      }
    }

    // 6. Save User Message into Database
    const currentFileUrl = uploadedFileDetails?.url || imageUrl || null;

    const usermessage = await messagemodel.create({
      role: "user",
      content: message || "", 
      chat: activeChatId,
      image: !isPDF ? currentFileUrl : null, 
      pdf: isPDF ? currentFileUrl : null     
    });

    // ==========================================
    // 7. Protected AI Response Generation Block
    // ==========================================
    let aiContent = "";

    if (isPDF && currentFileUrl) {
      try {
        if (typeof extractTextFromPDF === 'function') {
          const responseGenerator = await extractTextFromPDF(currentFileUrl, message || "");
          
          if (responseGenerator && typeof responseGenerator[Symbol.asyncIterator] === 'function') {
            for await (const chunk of responseGenerator) {
              if (chunk) aiContent += chunk;
            }
          } else {
            aiContent = responseGenerator?.text || responseGenerator || "";
          }
        } else {
          aiContent = "PDF service layer detached or not imported correctly.";
        }
      } catch (genError) {
        console.error("❌ Error in PDF AI Response Core:", genError);
        aiContent = `[System Recovery: PDF Context processing failed. ${genError.message}]`;
      }
    } else {
      try {
        const messagesHistory = await messagemodel.find({ chat: activeChatId }).sort({ createdAt: 1 });
        
        if (typeof startChat === 'function') {
          const responseGenerator = await startChat(messagesHistory, activeChatId);
          
          if (responseGenerator && typeof responseGenerator[Symbol.asyncIterator] === 'function') {
            for await (const chunk of responseGenerator) {
              if (chunk) aiContent += chunk;
            }
          } else {
            aiContent = responseGenerator?.text || responseGenerator?.content || responseGenerator || "";
          }
        } else {
          aiContent = "AI standard engine core (startChat) is not defined.";
        }
      } catch (genError) {
        console.error("❌ Error in standard AI Generation Core:", genError);
        aiContent = `[System Recovery: Core LLM pipeline failed. ${genError.message}]`;
      }
    }

    // 8. Clean AI Response Data
    let cleanedResponse = aiContent.trim();
    if (cleanedResponse.startsWith("tools")) {
      cleanedResponse = cleanedResponse.replace(/^tools\s*/, "").trim();
    }

    if (!cleanedResponse) {
      cleanedResponse = "System returned an unresolvable empty token chain.";
    }

    // 9. Save AI Response in Database
    const aimessage = await messagemodel.create({
      role: "ai",
      content: cleanedResponse,
      chat: activeChatId,
    });

    // 10. Return Unified Clean JSON Response
    return res.status(200).json({
      title: title || "Conversation Space",
      chatId: activeChatId,
      usermessage,
      aimessage,
      chatFile: uploadedFileDetails 
    });

  } catch (err) {
    console.error("=================== CRITICAL BACKEND TRACE ===================");
    console.error(err);
    console.error("==============================================================");
    
    return res.status(500).json({
      message: "Internal server error occurred within the controller loop.",
      error: err.message,
      stack: err.stack
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