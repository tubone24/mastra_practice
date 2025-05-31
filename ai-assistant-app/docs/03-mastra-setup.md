# 03. Mastraエージェントの追加

## 概要
このドキュメントでは、Mastraフレームワークを統合し、AIエージェントを追加する手順を説明します。

## 手順

### 1. Mastraの依存関係をインストール

```bash
npm install @mastra/core@latest zod mastra@latest --save-dev
npm install @ai-sdk/amazon-bedrock
```

### 2. Mastraディレクトリ構造の作成

```bash
mkdir -p src/mastra/agents
mkdir -p src/mastra/tools
mkdir -p src/mastra/workflows
```

### 3. Mastra設定ファイルの作成

src/mastra/index.ts を作成：

```typescript
// src/mastra/index.ts
import { Mastra } from "@mastra/core";
import { assistantAgent } from "./agents/assistantAgent";

export const mastra = new Mastra({
  agents: { assistantAgent },
});
```

### 4. アシスタントエージェントの作成

src/mastra/agents/assistantAgent.ts を作成：

```typescript
// src/mastra/agents/assistantAgent.ts
import { Agent } from "@mastra/core/agent";
import { bedrock } from "@ai-sdk/amazon-bedrock";

export const assistantAgent = new Agent({
  name: "assistant",
  instructions: "あなたは親切で知識豊富なAIアシスタントです。ユーザーの質問に対して、わかりやすく丁寧に回答してください。",
  model: bedrock("anthropic.claude-3-5-sonnet-20241022-v2:0"),
});
```

### 5. next.config.ts の更新

Mastraをサーバーサイドで実行するための設定を追加：

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"],
};

export default nextConfig;
```

### 6. APIルートの更新

src/app/api/chat/route.ts を更新してMastraエージェントを使用：

```typescript
// src/app/api/chat/route.ts
import { mastra } from "@/mastra";

// MastraはNode.jsランタイムが必要
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const agent = mastra.getAgent("assistantAgent");
  
  if (!agent) {
    throw new Error("Agent not found");
  }

  const stream = await agent.stream(messages);
  return stream.toDataStreamResponse();
}
```

### 7. Mastra CLI の設定（オプション）

package.json にスクリプトを追加：

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "mastra:dev": "mastra dev"
  }
}
```

## 動作確認

1. 開発サーバーを再起動：`npm run dev`
2. チャット画面でメッセージを送信
3. Mastraエージェントによる応答が返ってくることを確認

## トラブルシューティング

### インポートエラー
- tsconfig.json の paths 設定を確認
- next.config.ts の serverExternalPackages を確認

### エージェントが見つからない
- mastra.getAgent() の名前が正しいか確認
- エージェントが正しくエクスポートされているか確認

## 次のステップ
- [04-mcp-integration.md](./04-mcp-integration.md) - MCPツールの統合