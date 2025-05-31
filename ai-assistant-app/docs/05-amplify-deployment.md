# 05. AWS Amplifyデプロイメント設定

## 概要
このドキュメントでは、AWS Amplify Gen2を使用してアプリケーションをデプロイする手順を説明します。

## 前提条件
- AWSアカウントを持っていること
- AWS CLIがインストールされていること（オプション）

## 手順

### 1. Amplify CLIのインストール

```bash
npm install -D @aws-amplify/backend@latest @aws-amplify/backend-cli@latest
npm install aws-amplify@latest
```

### 2. Amplifyプロジェクトの初期化

```bash
npx ampx configure profile
```

プロファイル設定後：

```bash
npx ampx sandbox
```

### 3. 環境変数の設定

amplify/backend.ts を作成：

```typescript
// amplify/backend.ts
import { defineBackend } from '@aws-amplify/backend';
import { secret } from '@aws-amplify/backend';

export const backend = defineBackend({});

// 環境変数を定義
backend.addEnvironment({
  AWS_ACCESS_KEY_ID: secret('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: secret('AWS_SECRET_ACCESS_KEY'),
  AWS_REGION: secret('AWS_REGION')
});
```

### 4. ビルド設定

amplify.yml を作成：

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### 5. デプロイ用の環境変数設定

.env.production を作成：

```bash
# 本番環境では実際のAPI URLを使用
NEXT_PUBLIC_API_URL=https://your-amplify-app-url.amplifyapp.com
```

### 6. next.config.ts の更新

Amplifyでのビルドに対応するため更新：

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"],
  output: 'standalone',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
```

### 7. package.json のスクリプト更新

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "amplify:push": "npx ampx push"
  }
}
```

### 8. GitHubリポジトリへのプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 9. Amplifyコンソールでのデプロイ

1. AWSコンソールでAmplifyを開く
2. 「Host web app」をクリック
3. GitHubを選択して認証
4. リポジトリとブランチを選択
5. ビルド設定を確認（自動的にamplify.ymlが検出される）
6. 環境変数を設定：
   - `AWS_ACCESS_KEY_ID`: AWS アクセスキーID
   - `AWS_SECRET_ACCESS_KEY`: AWS シークレットアクセスキー
   - `AWS_REGION`: us-east-1（またはBedrockが利用可能なリージョン）
7. 「Save and deploy」をクリック

### 10. カスタムドメインの設定（オプション）

1. Amplifyコンソールで「Domain management」を選択
2. 「Add domain」をクリック
3. ドメインを入力して設定

## 本番環境での考慮事項

### APIルートの最適化

Edge Runtimeの設定を本番環境用に調整：

```typescript
// src/app/api/chat/route.ts
export const runtime = "nodejs"; // 本番環境ではNode.jsランタイムを使用
export const maxDuration = 300; // 5分のタイムアウト
```

### エラーハンドリング

本番環境用のエラーハンドリングを追加：

```typescript
try {
  // 処理
} catch (error) {
  console.error('Error in chat API:', error);
  return new Response('Internal Server Error', { status: 500 });
}
```

## トラブルシューティング

### ビルドエラー
- Node.jsバージョンがAmplifyでサポートされているか確認
- 依存関係が正しくインストールされているか確認

### 環境変数が読み込まれない
- Amplifyコンソールで環境変数が正しく設定されているか確認
- ビルドログを確認してエラーメッセージを特定

### タイムアウトエラー
- maxDurationの値を増やす
- Lambda関数のメモリを増やす（Amplifyコンソールから設定）

## 次のステップ
- [06-final-testing.md](./06-final-testing.md) - 最終テストと確認