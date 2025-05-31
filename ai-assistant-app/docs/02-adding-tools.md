# 02. ツールの追加

## 概要
このドキュメントでは、Mastraエージェントにツール（Web検索機能）を追加し、エージェントがより高度なタスクを実行できるようにします。

## 手順

### 1. Web検索ツールの作成

src/mastra/tools/webSearchTool.ts を作成：

```typescript
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
```

### 2. エージェントにツールを追加

src/mastra/agents/assistantAgent.ts を更新：

```typescript
import { Agent } from "@mastra/core/agent";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { webSearchTool } from "../tools/webSearchTool";

export const assistantAgent = new Agent({
  name: "assistant",
  instructions: "あなたは親切で知識豊富なAIアシスタントです。ユーザーの質問に対して、わかりやすく丁寧に回答してください。必要に応じてWeb検索ツールを使って最新情報を提供してください。",
  model: bedrock("anthropic.claude-3-5-sonnet-20241022-v2:0"),
  tools: {
    webSearch: webSearchTool
  }
});
```

### 3. 開発サーバーの再起動

```bash
npm run dev
```

### 4. ツールの動作確認

Mastra Playground (http://localhost:4111) で以下を試してみましょう：

1. 「最新のAI技術について教えて」と質問
2. エージェントがWeb検索ツールを呼び出すのを確認
3. 検索結果を基にした回答を確認

## ツールの仕組み

### ツールの構成要素

1. **id**: ツールの一意識別子
2. **description**: エージェントがツールを選択する際の説明
3. **inputSchema**: 入力パラメータの検証スキーマ（Zod）
4. **outputSchema**: 出力データの検証スキーマ
5. **execute**: ツールの実行ロジック

### エージェントのツール選択

エージェントは以下のプロセスでツールを使用します：

1. ユーザーの質問を分析
2. 必要に応じて適切なツールを選択
3. ツールを実行してデータを取得
4. 結果を基に回答を生成

## 実際のAPI統合例

### Tavily Search APIの使用

実際のWeb検索を行う場合の実装例：

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// 環境変数にTAVILY_API_KEYを設定

export const webSearchTool = createTool({
  id: "webSearch",
  description: "Search the web for current information",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    limit: z.number().optional().default(5)
  }),
  outputSchema: z.array(z.object({
    title: z.string(),
    url: z.string(),
    snippet: z.string()
  })),
  execute: async ({ context }) => {
    const { query, limit = 5 } = context;
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.TAVILY_API_KEY!
      },
      body: JSON.stringify({
        query,
        max_results: limit,
        include_raw_content: false
      })
    });

    const data = await response.json();
    
    return data.results.map((result: any) => ({
      title: result.title,
      url: result.url,
      snippet: result.snippet
    }));
  }
});
```

## 複数ツールの追加

エージェントには複数のツールを追加できます：

```typescript
export const assistantAgent = new Agent({
  name: "assistant",
  instructions: "...",
  model: bedrock("anthropic.claude-3-5-sonnet-20241022-v2:0"),
  tools: {
    webSearch: webSearchTool,
    calculator: calculatorTool,
    weatherInfo: weatherTool
  }
});
```

## ベストプラクティス

1. **エラーハンドリング**: ツール実行時の例外を適切に処理
2. **レート制限**: 外部APIのレート制限を考慮
3. **キャッシュ**: 頻繁なリクエストをキャッシュで最適化
4. **ログ**: ツールの使用状況をログに記録

## 次のステップ
- [03-creating-workflows.md](./03-creating-workflows.md) - ワークフローの作成