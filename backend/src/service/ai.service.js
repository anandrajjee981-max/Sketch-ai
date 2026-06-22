import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import * as z from "zod";

import { sendEmail } from "./mail.service.js";
import { latestinfo } from "./internet.service.js";

// Models
const geminimodel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

// Tools
const emailtool = tool(
  async ({ to, subject, html }) => {
    return await sendEmail({ to, subject, html });
  },
  {
    name: "emailtool",
    description: "Send email",
    schema: z.object({
      to: z.string(),
      subject: z.string(),
      html: z.string(),
    }),
  }
);

const internettool = tool(
  async ({ search }) => {
    return await latestinfo(search);
  },
  {
    name: "internettool",
    description: "Get latest information from internet",
    schema: z.object({
      search: z.string(),
    }),
  }
);

// Agent
const agent = createAgent({
  model: geminimodel,
  tools: [emailtool, internettool],
  systemPrompt: `
You are Sketch AI.

Use internettool whenever user asks:
- latest news
- current events
- today's information

Use emailtool whenever user explicitly wants to send email.
`,
});

// Chat
export async function* startChat(messages) {
  try {
    const formattedMessages = messages
      .map((msg) => {
        if (msg.role === "user") {
          return {
            role: "user",
            content: msg.content || "",
          };
        }

        if (msg.role === "ai" || msg.role === "assistant") {
          return {
            role: "assistant",
            content: msg.content || "",
          };
        }

        return null;
      })
      .filter(Boolean);

    const result = await agent.invoke({
      messages: formattedMessages,
    });
console.log(createAgent);
    const finalMessage =
      result?.messages?.[result.messages.length - 1]?.content ||
      "No response generated.";

    yield finalMessage;
  } catch (err) {
    console.error("Agent Error:", err);
    throw err;
  }
}

export async function genratetitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(
      "Generate a short title in 2-4 words only."
    ),
    new HumanMessage(message),
  ]);

  return String(response.content).trim();
}