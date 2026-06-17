import "dotenv/config";
import app from "./src/app.js";

import generateText from "./src/service/ai.service.js";
import startChat from "./src/service/ai.service.js";
import connectDatabase from "./src/config/db.js";
const PORT = process.env.PORT || 5000;


const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};
// startChat()

startServer();


