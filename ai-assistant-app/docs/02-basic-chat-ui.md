# 02. 基本的なチャットUIの実装

## 概要
このドキュメントでは、Assistant UIを使用して基本的なチャットインターフェースを実装します。

## 手順

### 1. ホームページの更新

src/app/page.tsx を更新して、アシスタントコンポーネントを表示します。

```tsx
// src/app/page.tsx
import { Assistant } from "./assistant";

export default function Home() {
  return <Assistant />;
}
```

### 2. 環境変数の設定

AWS Bedrockの認証情報を設定するため、.env.local ファイルを作成します。

```bash
# プロジェクトルートで実行
touch .env.local
```

.env.local に以下を追加：
```
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
```

※ AWS IAMユーザーに `AmazonBedrockFullAccess` ポリシーをアタッチし、Bedrockコンソールで Claude 3.5 Sonnetモデルへのアクセスをリクエストしてください。

### 3. APIルートの作成

Assistant UIが生成したAPIルートを確認し、Amazon Bedrockを使用するように実装します。

src/app/api/chat/route.ts を作成または編集：

```tsx
// src/app/api/chat/route.ts
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { streamText } from "ai";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system, tools } = await req.json();

  const result = streamText({
    model: bedrock("anthropic.claude-3-5-sonnet-20241022-v2:0"),
    messages,
    toolCallStreaming: true,
    system,
    tools: {
      ...frontendTools(tools),
    },
  });

  return result.toDataStreamResponse();
}
```

※ このコードは後のステップでMastraを統合してより高度な機能を追加します。

### 4. スタイルの調整（オプション）

必要に応じて、src/app/globals.css でスタイルを調整できます。

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開き、チャットUIが表示されることを確認します。

## 動作確認

1. チャット画面が表示される
2. メッセージを入力して送信できる
3. AIからの応答がストリーミング形式で表示される
4. スレッドリストが左側に表示される

## トラブルシューティング

### AWS認証エラー
- .env.local ファイルが正しく作成されているか確認
- AWS IAMユーザーに適切な権限があるか確認
- Bedrockコンソールでモデルアクセスが許可されているか確認
- 開発サーバーを再起動

### ビルドエラー
- Node.js バージョンが18以上か確認
- すべての依存関係が正しくインストールされているか確認

## 次のステップ
- [03-mastra-setup.md](./03-mastra-setup.md) - Mastraエージェントの追加