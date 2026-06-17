import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import morgan from 'morgan'

const app = express();
app.use(morgan('dev'))
app.use(cors({
    credentials : true ,
     origin: [
    "http://localhost:5173",
   
  ]
}))
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Perplexity clone backend is running." });
});







export default app
