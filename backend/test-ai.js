import "dotenv/config";
import { startChat, genratetitle } from "./src/service/ai.service.js";
import { HumanMessage } from "@langchain/core/messages";

console.log("🔍 Testing AI Service\n");

// Check API keys
console.log("📋 API Configuration:");
console.log("  GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "✅ Configured" : "❌ Missing");
console.log("  MISTRAL_API_KEY:", process.env.MISTRAL_API_KEY ? "✅ Configured" : "❌ Missing");
console.log("  TAVILY_API_KEY:", process.env.TAVILY_API_KEY ? "✅ Configured" : "❌ Missing\n");

async function testAI() {
  try {
    console.log("🚀 Testing AI Response with simple message...\n");
    
    const testMessages = [
      {
        role: "user",
        content: "What is 2 + 2?"
      }
    ];

    const generator = startChat(testMessages, "test_session");
    let fullResponse = "";
    let chunkCount = 0;

    console.log("📥 Receiving AI response:");
    for await (const chunk of generator) {
      chunkCount++;
      fullResponse += chunk;
      process.stdout.write(chunk);
    }

    console.log("\n\n✅ AI Response Complete!");
    console.log(`   Total chunks received: ${chunkCount}`);
    console.log(`   Response length: ${fullResponse.length} characters\n`);

    if (fullResponse.length === 0) {
      console.error("❌ ERROR: AI returned empty response!");
    } else {
      console.log("✅ Response received successfully:\n");
      console.log(fullResponse);
    }

  } catch (error) {
    console.error("❌ Error during AI test:", error.message);
    console.error(error);
  }
}

testAI();
