import { tavily } from "@tavily/core"

// ✅ FIX 1: API key ko object ke andar pass karo
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY })

export async function latestinfo(search) {
    try {
        if (!search) return "No search query provided.";

        console.log(`[Internet Tool] Searching for: "${search}"`);
        
        // Fetching from Tavily Client
        const response = await tvly.search(search, {
            searchDepth: "basic",
            maxResults: 4
        });

        // ✅ FIX 2: Tavily response mein .data nahi balki direct .results hota hai
        if (!response || !response.results || response.results.length === 0) {
            return `No internet search results found for "${search}".`;
        }

        // Saare search results ko text block mein merge karo taaki Agent samajh sake
        const contextString = response.results
            .map((result, index) => {
                return `Result ${index + 1}:\nTitle: ${result.title}\nURL: ${result.url}\nContent: ${result.content}\n---`;
            })
            .join("\n\n");

        return contextString;

    } catch (error) {
        console.error("Error fetching latest internet info:", error);
        // Tool ko crash karne ke bajay ek text error return karo taaki agent infinite loops mein na phase
        return `Failed to fetch live info due to error: ${error.message}`;
    }   
}