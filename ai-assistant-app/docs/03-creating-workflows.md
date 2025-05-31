# 03. ワークフローの作成

## 概要
このドキュメントでは、Mastraのワークフロー機能を使って、複数のステップを組み合わせた複雑な処理を実装します。

## ワークフローとは

ワークフローは、複数のステップを順番に実行する処理の流れを定義する仕組みです。各ステップでエージェントやツールを呼び出し、前のステップの結果を次のステップで利用できます。

## 手順

### 1. リサーチワークフローの作成

src/mastra/workflows/researchWorkflow.ts を作成：

```typescript
import { Workflow, Step } from "@mastra/core/workflows";
import { z } from "zod";
import { assistantAgent } from "../agents/assistantAgent";
import { webSearchTool } from "../tools/webSearchTool";

// ワークフローの入力スキーマ
const inputSchema = z.object({
  topic: z.string().describe("調査したいトピック"),
  depth: z.enum(["basic", "detailed"]).default("basic")
});

// ワークフローの出力スキーマ
const outputSchema = z.object({
  summary: z.string(),
  sources: z.array(z.string()),
  keyPoints: z.array(z.string())
});

export const researchWorkflow = new Workflow({
  name: "research",
  description: "トピックについて調査し、要約を作成します",
  inputSchema,
  outputSchema,
  steps: [
    // ステップ1: Web検索
    new Step({
      id: "search",
      description: "トピックについてWeb検索を実行",
      execute: async ({ input }) => {
        const searchResults = await webSearchTool.execute({
          context: {
            query: input.topic,
            limit: input.depth === "detailed" ? 10 : 5
          }
        });
        return { searchResults };
      }
    }),
    
    // ステップ2: 情報の分析
    new Step({
      id: "analyze",
      description: "検索結果を分析して要点を抽出",
      execute: async ({ input, previousSteps }) => {
        const searchResults = previousSteps.search.searchResults;
        
        const prompt = `
以下の検索結果を分析して、重要なポイントを抽出してください：

${JSON.stringify(searchResults, null, 2)}

出力形式：
- 要点を箇条書きで
- 最も重要な3つのポイントを特定
        `;
        
        const analysis = await assistantAgent.generate(prompt);
        return { analysis: analysis.text };
      }
    }),
    
    // ステップ3: サマリー作成
    new Step({
      id: "summarize",
      description: "最終的なサマリーを作成",
      execute: async ({ input, previousSteps }) => {
        const searchResults = previousSteps.search.searchResults;
        const analysis = previousSteps.analyze.analysis;
        
        const prompt = `
トピック: ${input.topic}
分析結果: ${analysis}

上記の情報を基に、わかりやすいサマリーを作成してください。
        `;
        
        const summary = await assistantAgent.generate(prompt);
        
        return {
          summary: summary.text,
          sources: searchResults.map((r: any) => r.url),
          keyPoints: analysis.split('\n').filter((line: string) => line.trim().startsWith('-'))
        };
      }
    })
  ]
});
```

### 2. Mastraインスタンスにワークフローを追加

src/mastra/index.ts を更新：

```typescript
import { Mastra } from "@mastra/core";
import { assistantAgent } from "./agents/assistantAgent";
import { researchWorkflow } from "./workflows/researchWorkflow";

export const mastra = new Mastra({
  agents: { assistantAgent },
  workflows: { researchWorkflow }
});
```

### 3. ワークフローの実行テスト

src/test-workflow.ts を作成：

```typescript
import { mastra } from "./mastra";

async function testResearchWorkflow() {
  try {
    const result = await mastra.runWorkflow("researchWorkflow", {
      topic: "最新のAI技術トレンド",
      depth: "detailed"
    });
    
    console.log("=== リサーチ結果 ===");
    console.log("サマリー:", result.summary);
    console.log("\n重要ポイント:");
    result.keyPoints.forEach((point: string, index: number) => {
      console.log(`${index + 1}. ${point}`);
    });
    console.log("\n情報源:");
    result.sources.forEach((source: string) => {
      console.log(`- ${source}`);
    });
  } catch (error) {
    console.error("ワークフロー実行エラー:", error);
  }
}

testResearchWorkflow();
```

### 4. ワークフローの実行

```bash
npx tsx src/test-workflow.ts
```

## Mastra Playgroundでの確認

開発サーバーを起動して、Playgroundでワークフローを確認：

```bash
npm run dev
```

Playground (http://localhost:4111) で：
1. 左側のメニューから「Workflows」を選択
2. 「research」ワークフローを選択
3. 入力パラメータを設定して実行
4. 各ステップの実行状況をリアルタイムで確認

## ワークフローの高度な機能

### 条件分岐

```typescript
new Step({
  id: "decide",
  execute: async ({ input, previousSteps }) => {
    if (previousSteps.search.searchResults.length < 3) {
      return { action: "need_more_search" };
    }
    return { action: "proceed_to_analysis" };
  }
})
```

### 並列実行

```typescript
new Step({
  id: "parallel_search",
  execute: async ({ input }) => {
    const [webResults, newsResults, academicResults] = await Promise.all([
      webSearchTool.execute({ context: { query: input.topic } }),
      newsSearchTool.execute({ context: { query: input.topic } }),
      academicSearchTool.execute({ context: { query: input.topic } })
    ]);
    
    return { webResults, newsResults, academicResults };
  }
})
```

### エラーハンドリング

```typescript
new Step({
  id: "safe_search",
  execute: async ({ input }) => {
    try {
      const results = await webSearchTool.execute({ context: { query: input.topic } });
      return { results, error: null };
    } catch (error) {
      return { results: [], error: error.message };
    }
  }
})
```

## ベストプラクティス

1. **ステップの粒度**: 各ステップは単一の責任を持つように設計
2. **スキーマ定義**: 入出力スキーマを明確に定義して型安全性を確保
3. **エラー処理**: 各ステップでエラーを適切に処理
4. **ログ**: 重要な処理にはログを追加してデバッグを容易に

## 次のステップ
- [04-nextjs-integration.md](./04-nextjs-integration.md) - Next.jsへの統合