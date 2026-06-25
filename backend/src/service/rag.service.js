import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import { URL } from 'url';
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Pinecone } from '@pinecone-database/pinecone'

const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed", 
  apiKey: process.env.MISTRALAI_API_KEY,
});

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 0
});
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });



export default async function extractTextFromPDF(pdfurl , message ) {
    try {
        const index = pc.index(pdfurl)
        const pdfUrl = new URL('story.pdf', import.meta.url);
        const buffer = fs.readFileSync(pdfUrl);
        
     
        const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        
        const parser = new PDFParse(uint8Array);
        const data = await parser.getText();
        
        // 1. SAFELY EXTRACT THE STRING
        // If data is an object with a text property, use that. Otherwise, fall back to casting it.
        const cleanText = typeof data === 'string' ? data : (data?.text || String(data));
        
        // 2. PASS THE STRING TO THE SPLITTER
        const chunks = await textSplitter.splitText(cleanText);
        console.log('Extracted text chunks from PDF:', chunks);
        
        const docs = await Promise.all(chunks.map(async (chunk) => {
            const embedding = await embeddings.embedQuery(chunk);
            return {
                text: chunk,
                embedding: embedding
            };
        }));
        console.log('Extracted documents with embeddings:', docs);
       const queryEmbedding = await embeddings.embedQuery(message);
        const similarityScores = docs.map(doc => {
            const dotProduct = doc.embedding.reduce((sum, value, index) => sum + value * queryEmbedding[index], 0);
            return dotProduct;
        });
        console.log(queryEmbedding)
const result2 = await index.upsert({
    records: docs.map((doc, i) => ({
        id: `doc-${i}`,
        values: doc.embedding,
        metadata: {
            text: doc.text
        }
    }))
})
const result = await index.query({
    vector: queryEmbedding,
    topK: 2,
    includeMetadata: true
})


console.log(JSON.stringify(result))
        return { docs, similarityScores }; // Returning docs and similarity scores so your server can use them
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw error;
    }
}