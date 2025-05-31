# 01. Mastraクイックスタート

## 概要
このドキュメントでは、まずMastraの開発サーバーを使ってAIエージェントの動作を確認します。Mastraの基本的な概念を理解してから、後のステップでNext.jsアプリケーションに統合します。

## 前提条件
- Node.js 20.x 以上（推奨）
- npm または yarn
- AWS アカウント（Amazon Bedrock用）

## 手順

### 1. プロジェクトディレクトリの作成

```bash
mkdir ai-assistant-app
cd ai-assistant-app
```

### 2. Mastraプロジェクトの初期化

```bash
npm init -y
npm install typescript tsx @types/node --save-dev
npm install @mastra/core zod @ai-sdk/amazon-bedrock
```

### 3. TypeScript設定ファイルの作成

tsconfig.json を作成：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 4. 環境変数の設定

.env ファイルを作成：

```bash
# AWS Bedrock Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
```

### 5. Mastraディレクトリ構造の作成

```bash
mkdir -p src/mastra/agents
mkdir -p src/mastra/tools
mkdir -p src/mastra/workflows
```

### 6. 最初のエージェントを作成

src/mastra/agents/assistantAgent.ts を作成：

```typescript
import { Agent } from "@mastra/core/agent";
import { bedrock } from "@ai-sdk/amazon-bedrock";

export const assistantAgent = new Agent({
  name: "assistant",
  instructions: "あなたは親切で知識豊富なAIアシスタントです。ユーザーの質問に対して、わかりやすく丁寧に回答してください。",
  model: bedrock("anthropic.claude-3-5-sonnet-20241022-v2:0"),
});
```

### 7. Mastraインスタンスの作成

src/mastra/index.ts を作成：

```typescript
import { Mastra } from "@mastra/core";
import { assistantAgent } from "./agents/assistantAgent";

export const mastra = new Mastra({
  agents: { assistantAgent },
});
```

### 8. 開発サーバーの起動スクリプト

package.json にスクリプトを追加：

```json
{
  "scripts": {
    "dev": "mastra dev",
    "start": "tsx src/index.ts"
  }
}
```

### 9. Mastra開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:4111 を開くと、Mastra Playground が表示されます。

## Mastra Playgroundでできること

1. **エージェントとの対話**: assistantAgentと直接会話できます
2. **ツールの実行**: 追加したツールをテストできます
3. **ワークフローのテスト**: 複雑な処理フローを確認できます
4. **ログの確認**: エージェントの思考プロセスを観察できます

## 動作確認

1. Playground でエージェントを選択
2. メッセージを入力して送信
3. Claude 3.5 Sonnetからの応答を確認

## トラブルシューティング

### ポートが使用中の場合
デフォルトポート（4111）が使用中の場合は、環境変数で変更できます：

```bash
MASTRA_PORT=4112 npm run dev
```

### AWS認証エラー
- .env ファイルが正しく設定されているか確認
- AWS IAMユーザーに適切な権限があるか確認
- Bedrockコンソールでモデルアクセスが許可されているか確認

## 次のステップ
- [02-adding-tools.md](./02-adding-tools.md) - ツールの追加