
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import readline from "readline";
import * as z from "zod";
import { createAgent, tool } from "langchain";
import { sendEmail } from "./mail.service.js";

import { ChatMistralAI } from "@langchain/mistralai"

const geminimodel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_API_KEY,
});
const mistralModel = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY
})

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
  model: geminimodel,
  tools: [emailtool],
});

export async function startChat(messages) {
  if (!messages?.length) {
    throw new Error("No messages provided");
  }

  const formattedMessages = messages
    .map((msg) => {
      if (msg.role === "user") {
        const contentParts = [];

        if (msg.content?.trim()) {
          contentParts.push(msg.content.trim());
        }

        if (msg.image) {
          contentParts.push(`Image URL: ${msg.image}`);
        }

        const humanContent = contentParts.join("\n");
        return new HumanMessage(humanContent || `Image URL: ${msg.image}`);
      }

      if (msg.role === "ai") {
        return new AIMessage(msg.content);
      }

      return null;
    })
    .filter(Boolean);

  const response = await geminimodel.invoke(formattedMessages);

  return response.content;
}
export async function genratetitle(message){

   const response = await mistralModel.invoke([
        new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
        `),
        new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
            `)
    ])

    return response.text;
}


