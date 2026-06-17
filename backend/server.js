import "dotenv/config";
import app from "./src/app.js";
import connectDatabase from "./src/config/db.js";
import generateText from "./src/service/ai.service.js";
import startChat from "./src/service/ai.service.js";
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/perplexity";

const startServer = async () => {
  try {
    await connectDatabase(MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};
startChat()
startServer();


