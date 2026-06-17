import Message from "../models/Message.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({})
      .populate("sender", "name email")
      .populate("chat", "chatName isGroupChat users")
      .populate({ path: "chat", populate: { path: "users", select: "name email" } });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMessage = async (req, res) => {
  const { sender, chat, content } = req.body;
  if (!sender || !chat || !content) {
    return res.status(400).json({ message: "sender, chat, and content are required." });
  }

  try {
    const validSender = await User.findById(sender);
    const validChat = await Chat.findById(chat);
    if (!validSender || !validChat) {
      return res.status(400).json({ message: "Invalid sender or chat." });
    }

    const message = await Message.create({ sender, chat, content });
    await Chat.findByIdAndUpdate(chat, { latestMessage: message._id });
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate({ path: "chat", populate: { path: "users", select: "name email" } });

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate("sender", "name email")
      .populate({ path: "chat", populate: { path: "users", select: "name email" } });
    if (!message) return res.status(404).json({ message: "Message not found." });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("sender", "name email")
      .populate({ path: "chat", populate: { path: "users", select: "name email" } });
    if (!message) return res.status(404).json({ message: "Message not found." });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found." });
    res.json({ message: "Message deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
