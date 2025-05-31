# 04. MCPツール統合

## 概要
このドキュメントでは、Model Context Protocol (MCP) を使用してWeb検索ツールを統合する手順を説明します。

## 手順

### 1. MCP SDKのインストール

```bash
npm install @modelcontextprotocol/sdk zod
```

### 2. MCPサーバーディレクトリの作成

```bash
mkdir -p mcp-servers/web-search
```

### 3. Web検索MCPサーバーの実装

mcp-servers/web-search/index.ts を作成：

```typescript
// mcp-servers/web-search/index.ts
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
```

### 4. MCPサーバーのビルドスクリプト追加

mcp-servers/web-search/package.json を作成：

```json
{
  "name": "web-search-mcp",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "zod": "^3.25.42"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

mcp-servers/web-search/tsconfig.json を作成：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "node16",
    "moduleResolution": "node16",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["index.ts"]
}
```

### 5. Mastraとの統合

src/mastra/mcp/client.ts を作成：

```typescript
// src/mastra/mcp/client.ts
import { McpClient } from "@modelcontextprotocol/sdk/client/mcp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import { Tool } from "@mastra/core";

export async function initializeMcpTools(): Promise<Record<string, Tool>> {
  const client = new McpClient({
    name: "mastra-client",
    version: "1.0.0"
  });

  // MCPサーバーを起動
  const serverProcess = spawn("node", [
    "mcp-servers/web-search/dist/index.js"
  ]);

  const transport = new StdioClientTransport({
    stdin: serverProcess.stdin,
    stdout: serverProcess.stdout
  });

  await client.connect(transport);

  // 利用可能なツールを取得
  const { tools } = await client.request({
    method: "tools/list"
  });

  // MastraのTool形式に変換
  const mastraTools: Record<string, Tool> = {};

  for (const tool of tools) {
    mastraTools[tool.name] = {
      name: tool.name,
      description: tool.description || "",
      parameters: tool.inputSchema,
      execute: async (params: any) => {
        const result = await client.request({
          method: "tools/call",
          params: {
            name: tool.name,
            arguments: params
          }
        });
        return result.content[0].text;
      }
    };
  }

  return mastraTools;
}
```

### 6. エージェントにツールを追加

src/mastra/agents/assistantAgent.ts を更新：

```typescript
// src/mastra/agents/assistantAgent.ts
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { initializeMcpTools } from "../mcp/client";

// ツールを初期化
const mcpTools = await initializeMcpTools();

export const assistantAgent = new Agent({
  name: "assistant",
  instructions: "あなたは親切で知識豊富なAIアシスタントです。必要に応じてWeb検索ツールを使って最新情報を提供してください。",
  model: openai("gpt-4o-mini"),
  tools: mcpTools
});
```

### 7. ビルドと実行

```bash
# MCPサーバーをビルド
cd mcp-servers/web-search
npm install
npm run build
cd ../..

# アプリケーションを実行
npm run dev
```

## 動作確認

1. チャット画面でWeb検索が必要な質問をする
2. エージェントがWeb検索ツールを呼び出す
3. 検索結果を基に回答が生成される

## トラブルシューティング

### MCPサーバーが起動しない
- Node.jsのバージョンを確認（v20以上推奨）
- MCPサーバーのビルドが成功しているか確認
- ログを確認してエラーメッセージを特定

### ツールが認識されない
- MCPクライアントの接続が確立されているか確認
- ツールのスキーマが正しく定義されているか確認

## 次のステップ
- [05-amplify-deployment.md](./05-amplify-deployment.md) - AWS Amplifyデプロイメント設定