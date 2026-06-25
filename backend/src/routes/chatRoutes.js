import express from "express";
const chatrouter = express.Router()
import verifyme from "../middleware/auth.middleware.js";
import { sendmessage ,getchat ,getmessage,deletemessage,upload} from "../controllers/chatController.js";
import multer from "multer";
chatrouter.post("/upload",multer().single("image"),verifyme, upload)
chatrouter.post("/message",multer().single("image"),verifyme,sendmessage)
chatrouter.get("/",verifyme,getchat)
chatrouter.get("/:chat",verifyme,getmessage)
chatrouter.delete("/delete/:chat",verifyme,deletemessage)




export default chatrouter

