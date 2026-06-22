import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt"; 
import * as z from "zod";
import { sendEmail } from "./mail.service.js";
import { latestinfo } from "./internet.service.js";
import { MemorySaver } from "@langchain/langgraph";

// Models Initialization
const geminimodel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

// Tools Definitions with schema validation
const emailtool = tool(
  async ({ to, html, subject }) => {
    return await sendEmail({ to, html, subject });
  },
  {
    name: "emailtool",
    description: "Use this tool to send emails.",
    schema: z.object({
      to: z.string().describe("Recipient email address"),
      html: z.string().describe("HTML formatting string content body"),
      subject: z.string().describe("Email clear subject layout"),
    }),
  }
);

const internettool = tool(
  async ({ search }) => {
    return await latestinfo(search);
  },
  {
    name: "internettool",
    description: "Use this tool to fetch the latest information from the internet.",
    schema: z.object({
      search: z.string().describe("Search query to fetch the latest information from the internet"),
    }),
  }
);

// System Message Layer configuration safely separated
const agentSystemPrompt = `You are a helpful assistant. If you don't know the answer to a question, say you don't know instead of making up an answer. If the user asks for latest information, ALWAYS use the internettool to fetch the latest information from the internet.`;

// ReAct Agent Builder initialization structure
const agent = createReactAgent({
  llm: geminimodel,
  tools: [emailtool, internettool],
  messageModifier: agentSystemPrompt, 
  checkpointer: new MemorySaver(), 
});

/**
 *  FIX: startChat ko Async Generator banaya streaming ke liye
 * MemorySaver sahi se chalne ke liye chatId (thread_id) bhi accept karega
 */
export async function* startChat(messages, chatId = "default_session") {
  if (!messages?.length) {
    throw new Error("No messages provided");
  }

  // Mutation Proof Parsing Array mapping
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

      if (msg.role === "ai" || msg.role === "assistant") {
        return new AIMessage(msg.content || msg.text || "");
      }

      return null;
    })
    .filter(Boolean);

  //  FIX: Sahi streaming syntax streamEvents ke liye aur thread_id integration
  const eventStream = await agent.streamEvents(
    { messages: formattedMessages },
    { version: "v2", configurable: { thread_id: chatId } }
  );

  for await (const event of eventStream) {
    const eventType = event.event;

    // Model se aane wale har ek text token ko catch karo aur yield karo
    if (eventType === "on_chat_model_stream") {
      const chunk = event.data.chunk;
      if (chunk?.content) {
        yield chunk.content; 
      }
    }
    
   
    else if (eventType === "on_tool_start") {
      yield `\n*🔄 [Using ${event.name}...]* \n`;
    }
  }
}

/**
 * Descriptive Title Generator mapping utilities
 */
export async function genratetitle(message) {
  if (!message) return "New Conversation Space";

  const response = await mistralModel.invoke([
    new SystemMessage(`
      You are a helpful assistant that generates concise and descriptive titles for chat conversations.
      User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. Do not put quote marks or extra explanation around the title.
    `),
    new HumanMessage(`
      Generate a title for a chat conversation based on the following first message:
      "${message}"
    `),
  ]);

  return response.content;
}