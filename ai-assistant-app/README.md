# AI Assistant App - Mastra + AI SDK + Next.js + AWS Amplify

このプロジェクトは、最新のAI開発技術スタックを統合したハンズオンチュートリアルの成果物です。

## 技術スタック

- **Next.js 15.3.3**: Reactベースのフルスタックフレームワーク
- **Assistant UI 0.10.19**: 高品質なチャットUIコンポーネント
- **Mastra 0.10.1**: TypeScript AIエージェントフレームワーク
- **Vercel AI SDK 4.3.16**: 統一されたAIインターフェース
- **Amazon Bedrock Claude 3.5 Sonnet**: LLMモデル
- **AWS Amplify Gen2**: フルスタックデプロイメント

## プロジェクト構造

```
ai-assistant-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts    # APIエンドポイント
│   │   ├── assistant.tsx       # アシスタントコンポーネント
│   │   └── page.tsx           # ホームページ
│   ├── components/            # UIコンポーネント
│   └── mastra/               # Mastra設定
│       ├── agents/           # AIエージェント
│       └── tools/            # ツール定義
├── docs/                     # ハンズオンドキュメント
├── mcp-servers/             # MCPサーバー（オプション）
└── amplify.yml             # Amplifyデプロイ設定
```

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下を設定：

```
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
```

※ AWS IAMユーザーに `AmazonBedrockFullAccess` ポリシーをアタッチし、Bedrockコンソールで Claude 3.5 Sonnetモデルへのアクセスをリクエストしてください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## 機能

- **チャット機能**: Assistant UIによる洗練されたチャットインターフェース
- **Mastraエージェント**: カスタマイズ可能なAIエージェント
- **Web検索ツール**: エージェントが使用できるツール（モック実装）
- **ストリーミング応答**: リアルタイムでの応答表示

## デプロイ

### AWS Amplifyへのデプロイ

1. GitHubリポジトリにプッシュ
2. AWS AmplifyコンソールでGitHubと連携
3. 環境変数を設定
4. デプロイを実行

詳細は `docs/05-amplify-deployment.md` を参照してください。

## ドキュメント

### 新しいハンズオン手順（Mastraファースト）

Mastraの開発サーバーで動作を確認してから、Next.jsに統合する流れ：

1. [01-mastra-quickstart.md](docs/01-mastra-quickstart.md) - Mastraクイックスタート
2. [02-adding-tools.md](docs/02-adding-tools.md) - ツールの追加
3. [03-creating-workflows.md](docs/03-creating-workflows.md) - ワークフローの作成
4. [04-nextjs-integration.md](docs/04-nextjs-integration.md) - Next.jsへの統合
5. [05-advanced-ui.md](docs/05-advanced-ui.md) - 高度なUIの実装
6. [06-deployment.md](docs/06-deployment.md) - AWS Amplifyへのデプロイ

### 従来のハンズオン手順（Next.jsファースト）

Next.jsプロジェクトから始める従来の流れ：

1. [01-project-initialization.md](docs/01-project-initialization.md) - プロジェクト初期化
2. [02-basic-chat-ui.md](docs/02-basic-chat-ui.md) - 基本的なチャットUI
3. [03-mastra-setup.md](docs/03-mastra-setup.md) - Mastraエージェント
4. [04-mcp-integration.md](docs/04-mcp-integration.md) - MCPツール統合
5. [05-amplify-deployment.md](docs/05-amplify-deployment.md) - Amplifyデプロイ
6. [06-final-testing.md](docs/06-final-testing.md) - 最終テスト

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを作成して変更内容を議論してください。