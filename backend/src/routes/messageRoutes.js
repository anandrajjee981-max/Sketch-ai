import express from "express";
import {
  getMessages,
  createMessage,
  getMessageById,
  updateMessage,
  deleteMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/", getMessages);
router.post("/", createMessage);
router.get("/:id", getMessageById);
router.put("/:id", updateMessage);
router.delete("/:id", deleteMessage);

export default router;
