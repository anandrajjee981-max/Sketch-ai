import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({})
      .populate("users", "name email")
      .populate({ path: "latestMessage", populate: { path: "sender", select: "name email" } });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createChat = async (req, res) => {
  const { chatName, isGroupChat, users } = req.body;
  if (!users || !Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ message: "Users array is required." });
  }

  try {
    const validUsers = await User.find({ _id: { $in: users } });
    if (validUsers.length !== users.length) {
      return res.status(400).json({ message: "One or more users are invalid." });
    }

    const chat = await Chat.create({ chatName, isGroupChat: Boolean(isGroupChat), users });
    const populatedChat = await Chat.findById(chat._id).populate("users", "name email");
    res.status(201).json(populatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("users", "name email")
      .populate({ path: "latestMessage", populate: { path: "sender", select: "name email" } });
    if (!chat) return res.status(404).json({ message: "Chat not found." });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("users", "name email")
      .populate({ path: "latestMessage", populate: { path: "sender", select: "name email" } });
    if (!chat) return res.status(404).json({ message: "Chat not found." });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);
    if (!chat) return res.status(404).json({ message: "Chat not found." });
    await Message.deleteMany({ chat: chat._id });
    res.json({ message: "Chat and related messages deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
