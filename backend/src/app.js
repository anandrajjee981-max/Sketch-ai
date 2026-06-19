import express from "express";
import cors from "cors";
import chatrouter from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
const app = express();
app.use(morgan('dev'))
app.use(cors({
    credentials : true ,
     origin: [
    "http://localhost:5173",
   
  ]
}))
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/chats",chatrouter)

app.get("/", (req, res) => {
  res.json({ message: "Perplexity clone backend is running." });
});







export default app
