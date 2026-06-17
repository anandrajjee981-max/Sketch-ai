
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import readline from "readline";
import * as z from "zod";
import { createAgent, tool } from "langchain";
import { sendEmail } from "./mail.service.js";
// Write an email to anandrajjee981@gmail.com with the subject "New Song Releases This Week" listing 5 new songs.

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_API_KEY,
});

const emailtool = tool(sendEmail, {
  name: "emailtool",
  description: "Use this tool to send emails",
  schema: z.object({
    to: z.string().describe("Recipient email"),
    html: z.string().describe("HTML content"),
    subject: z.string().describe("Email subject"),
  }),
});

const agent = createAgent({
  model,
  tools: [emailtool],
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

const chatHistory = [];

async function startChat() {
  console.log("AI Assistant Started...\n");

  while (true) {
    try {
      const usermessage = (
        await askQuestion("\x1b[32mYou:\x1b[0m ")
      ).trim();

      if (!usermessage) continue;

      if (
        usermessage.toLowerCase() === "exit" ||
        usermessage.toLowerCase() === "quit"
      ) {
        console.log("\nGoodbye!");
        rl.close();
        process.exit(0);
      }

      chatHistory.push(
        new HumanMessage({
          content: usermessage,
        })
      );

      const res = await agent.invoke({
        messages: chatHistory,
      });

      const latestMessage =
        res.messages?.[res.messages.length - 1];

      if (!latestMessage) {
        console.log("[AI] No response received.");
        continue;
      }

      chatHistory.push(latestMessage);

      console.log(
        `\x1b[34m[AI]\x1b[0m ${
          typeof latestMessage.content === "string"
            ? latestMessage.content
            : JSON.stringify(latestMessage.content)
        }`
      );
    } catch (error) {
      console.error(
        "\x1b[31m[ERROR]\x1b[0m",
        error.message
      );
    }
  }
}

export default startChat;

