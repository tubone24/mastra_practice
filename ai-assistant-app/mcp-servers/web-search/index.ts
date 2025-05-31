import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({ 
  name: "Web Search Server", 
  version: "1.0.0" 
});

// Add web search tool
server.tool(
  "web_search",
  {
    query: z.string().describe("Search query"),
    limit: z.number().max(10).default(5).describe("Number of results")
  },
  async ({ query, limit }) => {
    // シンプルなモック実装（実際の実装ではAPIを使用）
    const results = [
      {
        title: `Result 1 for "${query}"`,
        url: `https://example.com/1`,
        snippet: `This is a search result for ${query}...`
      },
      {
        title: `Result 2 for "${query}"`,
        url: `https://example.com/2`,
        snippet: `Another result about ${query}...`
      }
    ].slice(0, limit);

    return {
      content: [{
        type: "text",
        text: JSON.stringify(results, null, 2)
      }]
    };
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Web Search MCP Server started");
}

main().catch(console.error);