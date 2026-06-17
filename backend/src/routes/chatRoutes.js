import express from "express";
import {
  getChats,
  createChat,
  getChatById,
  updateChat,
  deleteChat,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/", getChats);
router.post("/", createChat);
router.get("/:id", getChatById);
router.put("/:id", updateChat);
router.delete("/:id", deleteChat);

export default router;
