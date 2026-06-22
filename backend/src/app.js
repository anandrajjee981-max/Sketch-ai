import express from "express";
import cors from "cors";
import chatrouter from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from "path";
import { fileURLToPath } from "url"; // <-- 1. Import this

// 2. Recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(morgan('dev'));
app.use(cors({
    credentials: true,
    origin: [
        "http://localhost:5173",
        "https://sketch-ai-earj.onrender.com"
    ]
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatrouter);

// Lightweight debug endpoint to verify AI keys presence (returns booleans only)
app.get("/api/debug", (req, res) => {
  res.json({
    google_api_key_present: !!process.env.GOOGLE_API_KEY,
    mistral_api_key_present: !!process.env.MISTRAL_API_KEY,
    debug_enabled: !!process.env.DEBUG,
  });
});



app.use(express.static(path.join(__dirname, "../public/dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/dist/index.html"));
});

export default app;