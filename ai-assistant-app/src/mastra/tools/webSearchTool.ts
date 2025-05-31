import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const webSearchTool = createTool({
  id: "webSearch",
  description: "Search the web for information",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    limit: z.number().optional().default(5).describe("Number of results to return")
  }),
  outputSchema: z.array(z.object({
    title: z.string(),
    url: z.string(),
    snippet: z.string()
  })),
  execute: async ({ context }) => {
    const { query, limit = 5 } = context;
    
    // モック実装 - 実際の実装ではTavily APIやDuckDuckGo APIを使用
    const mockResults = [
      {
        title: `Search result 1 for "${query}"`,
        url: `https://example.com/1`,
        snippet: `This is a relevant result about ${query}...`
      },
      {
        title: `Search result 2 for "${query}"`,
        url: `https://example.com/2`,
        snippet: `Another interesting finding related to ${query}...`
      },
      {
        title: `Search result 3 for "${query}"`,
        url: `https://example.com/3`,
        snippet: `More information about ${query}...`
      }
    ].slice(0, limit);

    return mockResults;
  }
});