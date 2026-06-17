import express from "express";
import { registerUser, verifyUser, loginUser ,getme} from "../controllers/authController.js";
import verifyme from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.get("/verify", verifyUser);
router.post("/login", loginUser);
router.get("/getme",verifyme,getme)
export default router;
