import express from "express";
const chatrouter = express.Router()
import verifyme from "../middleware/auth.middleware.js";
import { sendmessage ,getchat ,getmessage,deletemessage} from "../controllers/chatController.js";
chatrouter.post("/message",verifyme,sendmessage)
chatrouter.get("/",verifyme,getchat)
chatrouter.get("/:chat",verifyme,getmessage)
chatrouter.delete("/:chat",verifyme,deletemessage)




export default chatrouter

