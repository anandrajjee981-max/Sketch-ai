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
  apiKey: process.env.GOOGLE_API_KEY?.trim(),
});

const mistralModel = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: process.env.MISTRAL_API_KEY?.trim(),
});

// Validate API keys on startup
if (!process.env.GOOGLE_API_KEY?.trim()) {
  console.error("❌ GOOGLE_API_KEY is not configured");
}
if (!process.env.MISTRAL_API_KEY?.trim()) {
  console.error("❌ MISTRAL_API_KEY is not configured");
}

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

  try {
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

    console.log(`[AI Service] Processing ${formattedMessages.length} messages for chat: ${chatId}`);

    //  FIX: Sahi streaming syntax streamEvents ke liye aur thread_id integration
    const eventStream = await agent.streamEvents(
      { messages: formattedMessages },
      { version: "v2", configurable: { thread_id: chatId } }
    );

    let eventCount = 0;
    let contentCount = 0;

    for await (const event of eventStream) {
      eventCount++;
      const eventType = event.event;

      // Debug: Log all events to identify response structure
      if (process.env.DEBUG) {
        console.log(`[Event ${eventCount}] ${eventType}:`, JSON.stringify(event, null, 2));
      }

      // Model se aane wale har ek text token ko catch karo aur yield karo
      if (eventType === "on_chat_model_stream") {
        const chunk = event.data.chunk;
        if (chunk?.content) {
          contentCount++;
          yield chunk.content; 
        }
      }
      
      // Catch the final AI response from tool output events
      else if (eventType === "on_tool_end" && event.data?.output) {
        contentCount++;
        const output = event.data.output;
        // Handle both string and object outputs from tools
        let outputText = "";
        if (typeof output === 'string') {
          outputText = output;
        } else if (output && typeof output === 'object') {
          // Filter out [object ToolMessage] and other debug strings
          outputText = String(output).replace(/\[object \w+\]/g, "").trim();
        }
        if (outputText) {
          yield outputText;
        }
      }

      // Catch text from other streaming events
      else if (eventType === "on_chain_stream" && event.data?.chunk) {
        if (typeof event.data.chunk === 'string') {
          contentCount++;
          const chunk = event.data.chunk.trim();
          // Skip metadata-like chunks
          if (chunk && chunk !== "tools" && !chunk.startsWith("[")) {
            yield chunk;
          }
        }
      }

      // Catch agent end event with final output
      else if (eventType === "on_chain_end" && event.data?.output) {
        const output = event.data.output;
        // If output is an object with output property, extract it
        if (output?.output) {
          contentCount++;
          // Filter out metadata markers like __end__
          const cleanOutput = String(output.output).replace(/__end__/g, "").trim();
          if (cleanOutput) {
            yield cleanOutput;
          }
        } else if (typeof output === 'string' && output !== "__end__") {
          contentCount++;
          const cleanOutput = output.replace(/__end__/g, "").trim();
          if (cleanOutput) {
            yield cleanOutput;
          }
        }
      }

      else if (eventType === "on_tool_start") {
        // Tool start event - can be logged but not yielded to keep response clean
        console.log(`[AI Service] Using tool: ${event.data?.tool}`);
      }
    }

    console.log(`[AI Service] Processed ${eventCount} events, yielded ${contentCount} chunks for chat: ${chatId}`);

  } catch (error) {
    console.error(`[AI Service] Error in startChat for ${chatId}:`, error);
    throw error;
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