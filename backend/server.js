import "dotenv/config";
import app from "./src/app.js";
import http from 'http'
import { initsocket } from "./src/sockets/server.socket.js";
import {extractTextFromPDF} from './src/service/rag.service.js'

import connectDatabase from "./src/config/db.js";
const PORT = process.env.PORT || 5000;

const httpserver = http.createServer(app)
initsocket(httpserver)
const startServer = async () => {
  try {
    await connectDatabase();
    httpserver.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};
// startChat()
extractTextFromPDF()
startServer();


