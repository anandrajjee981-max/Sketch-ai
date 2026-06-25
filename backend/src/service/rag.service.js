import { PDFParse } from 'pdf-parse';
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Pinecone } from '@pinecone-database/pinecone';

const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed", 
  apiKey: process.env.MISTRALAI_API_KEY,
});

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200 // Thoda overlap rakhna better context retrieval deta hai
});

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// 🔥 FIX 1: Pinecone dashboard par bane actual static index ka naam yahan likhein
const PINECONE_INDEX_NAME = "pdf-chat-index"; 

export default async function extractTextFromPDF(pdfurl, message) {
  try {
    const index = pc.index(PINECONE_INDEX_NAME);

    // 🔥 FIX 2: Download the remote PDF from ImageKit URL instead of using local fs.readFileSync
    console.log("🌐 Fetching PDF from remote URL:", pdfurl);
    const response = await fetch(pdfurl);
    if (!response.ok) throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Parse PDF
    const parser = new PDFParse(uint8Array);
    const data = await parser.getText();
    
    const cleanText = typeof data === 'string' ? data : (data?.text || String(data));
    if (!cleanText.trim()) throw new Error("PDF parsing returned empty text.");

    // Chunk text
    const chunks = await textSplitter.splitText(cleanText);
    console.log(`📑 Created ${chunks.length} text chunks.`);
    
    // Create Embeddings
    const docs = await Promise.all(chunks.map(async (chunk) => {
      const embedding = await embeddings.embedQuery(chunk);
      return {
        text: chunk,
        embedding: embedding
      };
    }));

    // 🔥 FIX 3: Dynamic Namespace (URL string se alpha-numeric ID nikalna taaki safe isolated store bane)
    // Isse har PDF ka data alag namespace mein rahega aur overwrite nahi hoga
    const namespaceId = encodeURIComponent(pdfurl).replace(/[^a-zA-Z0-9]/g, "").substring(0, 60);

    // Upsert vectors with namespace
    console.log("☁️ Upserting vectors to Pinecone namespace:", namespaceId);
    await index.namespace(namespaceId).upsert(
      docs.map((doc, i) => ({
        id: `doc-${i}-${Date.now()}`, // Unique identity setup
        values: doc.embedding,
        metadata: { text: doc.text }
      }))
    );

    // Embed user message and query the same namespace
    console.log("🔍 Querying Pinecone for matches...");
    const queryEmbedding = await embeddings.embedQuery(message);
    
    const queryResponse = await index.namespace(namespaceId).query({
      vector: queryEmbedding,
      topK: 3, // Best top 3 match chunks uthao
      includeMetadata: true
    });

    // Match contexts extract karke continuous paragraph context string banao
    const contextText = queryResponse.matches
      ?.map(match => match.metadata?.text)
      .filter(Boolean)
      .join("\n\n") || "";

    console.log("✅ Context generated successfully from Pinecone.");

    // Aapka controller generator stream syntax expect karta hai response ke liye,
    // to hum yahan directly custom text package build karke return kar rahe hain.
    return contextText || "No matching context found in document.";

  } catch (error) {
    console.error('❌ Error inside extractTextFromPDF service:', error);
    throw error;
  }
}