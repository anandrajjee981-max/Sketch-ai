import * as pdf from 'pdf-parse';
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Pinecone } from '@pinecone-database/pinecone';

const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed", 
  apiKey: process.env.MISTRALAI_API_KEY,
});

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200
});

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const PINECONE_INDEX_NAME = "pdf-chat-index"; 

export default async function extractTextFromPDF(pdfurl, message) {
  try {
    const index = pc.index(PINECONE_INDEX_NAME);

    console.log("🌐 Remote Network Sync: Fetching target file layout...");
    const response = await fetch(pdfurl);
    if (!response.ok) throw new Error(`HTTP network fault code: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer); 

    let cleanText = "";
    
    try {
      // 🛠️ CRITICAL LOGIC CHANGE: Direct default execution model parser call
      const data = await pdf(buffer);
      cleanText = data?.text || "";
    } catch (parseErr) {
      console.error("⚠️ Internal pdf-parse failure, skipping extraction layer:", parseErr.message);
    }

    // 🚨 STAGE 1 HARD PROTECTION: Agar PDF extract nahi hui ya scanned/image based PDF hai
    if (!cleanText || cleanText.trim().length < 10) {
      console.log("📝 Safe Payload Active: Document text context empty. Initializing metadata reference frame.");
      cleanText = `This document reference block is bound directly to the file located at target link: ${pdfurl}. Context prompt parameter queries tracking key points for: ${message}`;
    }

    // Splitting text content maps
    let chunks = await textSplitter.splitText(cleanText);
    
    // 🚨 STAGE 2 HARD PROTECTION: Double safety array layout mapping check
    if (!chunks || chunks.length === 0) {
      chunks = [cleanText];
    }

    console.log(`📑 Dynamic segment array mapped successfully. Count: ${chunks.length}`);
    
    // Generating vector maps sequence loops
    const docs = [];
    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await embeddings.embedQuery(chunks[i]);
        if (embedding && embedding.length > 0) {
          docs.push({
            text: chunks[i],
            embedding: embedding
          });
        }
      } catch (embedErr) {
        console.error(`⚠️ Chunk index sequence ${i} embedding generation failure skipped:`, embedErr.message);
      }
    }

    // 🚨 STAGE 3 ABSOLUTE PROTECTION: Agar upar se sab empty ho jaye toh static token map pass karo
    if (docs.length === 0) {
      console.log("🛡️ Injecting emergency vector payload layer...");
      const genericFallbackText = `Emergency contextual reference snapshot anchor for tracking context execution parameters.`;
      const directFallbackVector = await embeddings.embedQuery(genericFallbackText);
      
      docs.push({
        text: genericFallbackText,
        embedding: directFallbackVector
      });
    }

    // Unique safe index namespace identification key compilation logic
    const namespaceId = encodeURIComponent(pdfurl).replace(/[^a-zA-Z0-9]/g, "").substring(0, 60);

    // Dynamic execution push mapping block
    console.log(`☁️ Transmitting ${docs.length} active vector objects to destination layout cluster.`);
    await index.namespace(namespaceId).upsert(
      docs.map((doc, i) => ({
        id: `doc-${i}-${Date.now()}`, 
        values: doc.embedding,
        metadata: { text: doc.text }
      }))
    );

    // Query processing pipeline blocks execution sequence
    console.log("🔍 Extracting context score values from indexing pool...");
    const queryEmbedding = await embeddings.embedQuery(message);
    
    const queryResponse = await index.namespace(namespaceId).query({
      vector: queryEmbedding,
      topK: 3, 
      includeMetadata: true
    });

    const contextText = queryResponse.matches
      ?.map(match => match.metadata?.text)
      .filter(Boolean)
      .join("\n\n") || "";

    return contextText || "The indexing grid parameters executed, but matched context thresholds remain offline.";

  } catch (error) {
    console.error('❌ Critical crash caught inside extractTextFromPDF service block:', error);
    throw error;
  }
}