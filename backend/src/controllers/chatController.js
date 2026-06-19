import chatmodel from "../models/Chat.js";
import messagemodel from "../models/Message.js";
import { startChat, genratetitle } from "../service/ai.service.js";

export async function sendmessage(req, res) {
  try {
    const { message, chat: chatid } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    let title = null;
    let chatId = chatid;

    // Create new chat
    if (!chatId) {
      title = await genratetitle(message);

      const newChat = await chatmodel.create({
        title,
        user: req.user.id,
      });

      chatId = newChat._id;
    }

    // Save current user message FIRST
    const usermessage = await messagemodel.create({
      role: "user",
      content: message,
      chat: chatId,
    });

    // Fetch conversation history
    const messages = await messagemodel
      .find({ chat: chatId })
      .sort({ createdAt: 1 });

    console.log("Messages sent to AI:", messages.length);

    // Generate AI response
    const response = await startChat(messages);

    // Save AI response
    const aimessage = await messagemodel.create({
      role: "ai",
      content: response,
      chat: chatId,
    });

    return res.status(200).json({
      title,
      chatId,
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
export async function getchat(req,res){
  const user = req.user.id
const chat = await chatmodel.find({user : user})
if(!chat){
  return res.status(404).json({
    message : "no chat found"
  })
}
res.status(200).json({
  chat
})

}
export async function getmessage(req,res){
  const chat = req.params.chat
  const message = await messagemodel.find({chat : chat})
  if(!message){
    return res.status(400).json({
      message : "not message found"
    })
  }
  res.status(200).json({
    message
  })

}
export async function deletemessage(req,res){
  const chat = req.params.chat
  const message = await messagemodel.findOneAndDelete({chat : chat})
  res.status(200).json({
    message : "deleted sucessfully"
  })
}










