# 06. AWS Amplifyへのデプロイ

## 概要
このドキュメントでは、作成したAIアシスタントアプリケーションをAWS Amplify Gen2にデプロイする手順を説明します。

## 前提条件
- AWSアカウント
- GitHub リポジトリ
- 動作確認済みのローカルアプリケーション

## 手順

### 1. プロジェクトの準備

#### TypeScript設定の調整

tsconfig.json を本番環境用に更新：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 2. Amplify CLIのインストール

```bash
npm install -D @aws-amplify/backend@latest @aws-amplify/backend-cli@latest
npm install aws-amplify@latest
```

### 3. Amplify設定ファイルの作成

amplify/backend.ts を作成：

```typescript
import { defineBackend } from '@aws-amplify/backend';
import { secret } from '@aws-amplify/backend';
import { Stack } from 'aws-cdk-lib';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({});

// シークレットの定義
backend.addEnvironment({
  AWS_ACCESS_KEY_ID: secret('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: secret('AWS_SECRET_ACCESS_KEY'),
  AWS_REGION: secret('AWS_REGION')
});

// Lambda関数の設定（Next.js SSR用）
backend.createStack('NextJsStack', (stack: Stack) => {
  // Lambda関数のメモリとタイムアウトを増やす
  const lambdaFunction = new Function(stack, 'NextJsFunction', {
    runtime: 'nodejs20.x',
    memorySize: 1024,
    timeout: 300, // 5分
  });

  // Bedrock権限の追加
  lambdaFunction.addToRolePolicy(new PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: ['*'],
  }));
});
```

### 4. amplify.yml の作成

プロジェクトルートに amplify.yml を作成：

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - echo "AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID" >> .env.production
        - echo "AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY" >> .env.production
        - echo "AWS_REGION=$AWS_REGION" >> .env.production
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

### 5. next.config.js の本番環境対応

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  serverExternalPackages: ["@mastra/*"],
  experimental: {
    serverActions: true,
  },
  images: {
    unoptimized: true,
  },
  // Amplify用の設定
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
```

### 6. 環境変数の管理

.env.production を作成：

```bash
# 本番環境変数
NEXT_PUBLIC_APP_URL=https://your-app-url.amplifyapp.com
NODE_ENV=production
```

### 7. GitHubリポジトリへのプッシュ

```bash
# Gitの初期化（まだの場合）
git init

# .gitignoreの確認
echo "node_modules/" >> .gitignore
echo ".env*" >> .gitignore
echo ".next/" >> .gitignore
echo "out/" >> .gitignore
echo ".DS_Store" >> .gitignore

# コミット
git add .
git commit -m "Initial commit: AI Assistant with Mastra and Bedrock"

# GitHubリポジトリの作成とプッシュ
git remote add origin https://github.com/your-username/ai-assistant-app.git
git push -u origin main
```

### 8. AWS Amplifyコンソールでのセットアップ

1. **AWSコンソールにログイン**
2. **Amplifyサービスを開く**
3. **「Host web app」をクリック**
4. **GitHubを選択して認証**
5. **リポジトリとブランチを選択**

### 9. ビルド設定の確認

Amplifyが自動的に amplify.yml を検出します。以下を確認：

- Build and test settings
- Advanced settings でNode.jsバージョンを20に設定

### 10. 環境変数の設定

Amplifyコンソールで Environment variables を設定：

```
AWS_ACCESS_KEY_ID: your-access-key
AWS_SECRET_ACCESS_KEY: your-secret-key
AWS_REGION: us-east-1
```

### 11. デプロイの実行

「Save and deploy」をクリックしてデプロイを開始。

## デプロイ後の確認

### 1. アプリケーションのテスト

- 提供されたURLにアクセス
- チャット機能の動作確認
- エラーログの確認

### 2. パフォーマンスの最適化

#### CloudFrontの設定

```yaml
# amplify.yml に追加
customHeaders:
  - pattern: '**/*'
    headers:
      - key: 'Cache-Control'
        value: 'public, max-age=31536000, immutable'
```

#### Lambda関数の最適化

```typescript
// 予約された同時実行数の設定
backend.createStack('OptimizationStack', (stack: Stack) => {
  const fn = stack.node.tryFindChild('NextJsFunction') as Function;
  if (fn) {
    fn.addEnvironment('AWS_NODEJS_CONNECTION_REUSE_ENABLED', '1');
  }
});
```

### 3. モニタリングの設定

#### CloudWatch Logs

- Lambda関数のログを確認
- エラー率の監視
- レスポンスタイムの追跡

#### X-Ray トレーシング

```typescript
// Lambda関数でX-Rayを有効化
import { Tracing } from 'aws-cdk-lib/aws-lambda';

const lambdaFunction = new Function(stack, 'NextJsFunction', {
  // ... 他の設定
  tracing: Tracing.ACTIVE,
});
```

## トラブルシューティング

### ビルドエラー

1. **メモリ不足**
   ```yaml
   # amplify.yml
   build:
     commands:
       - node --max-old-space-size=4096 ./node_modules/.bin/next build
   ```

2. **タイムアウト**
   - ビルドのタイムアウトを延長（Amplifyコンソール）

### ランタイムエラー

1. **504 Gateway Timeout**
   - Lambda関数のタイムアウトを増やす
   - API Gateway のタイムアウト設定を確認

2. **環境変数が読めない**
   - Amplifyコンソールで正しく設定されているか確認
   - ビルドログで環境変数の読み込みを確認

## セキュリティのベストプラクティス

1. **IAMロールの最小権限**
   ```typescript
   lambdaFunction.addToRolePolicy(new PolicyStatement({
     actions: ['bedrock:InvokeModel'],
     resources: [`arn:aws:bedrock:*:*:model/anthropic.claude-3-5-sonnet*`],
   }));
   ```

2. **シークレットの管理**
   - AWS Secrets Manager を使用
   - 環境変数の暗号化

3. **APIの保護**
   - レート制限の実装
   - 認証の追加（Cognito等）

## まとめ

これでMastraとAmazon Bedrockを使用したAIアシスタントアプリケーションがAWS Amplifyにデプロイされました。継続的なデプロイが設定されているため、GitHubにプッシュするだけで自動的に更新されます。