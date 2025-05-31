        　# 01. プロジェクト初期化

## 概要
このドキュメントでは、AI Assistant アプリケーションのプロジェクト初期化手順を説明します。

## 前提条件
- Node.js 18.x 以上
- npm または yarn
- Git

## 手順

### 1. Next.js プロジェクトの作成

```bash
npx create-next-app@latest ai-assistant-app --typescript --tailwind --app
```

プロンプトの選択：
- Would you like to use ESLint? → Yes
- Would you like to use `src/` directory? → No
- Would you like to use experimental `app/` directory? → Yes
- Would you like to customize the default import alias (@/*)? → No

### 2. プロジェクトディレクトリへの移動

```bash
cd ai-assistant-app
```

### 3. 基本的な依存関係のインストール

```bash
npm install ai @ai-sdk/amazon-bedrock
```

### 4. Assistant UI のインストール

Assistant UIの依存関係を追加します：

```bash
npm install @assistant-ui/react @assistant-ui/react-ai-sdk @assistant-ui/react-markdown
npm install @radix-ui/react-slot @radix-ui/react-tooltip
npm install lucide-react class-variance-authority clsx tailwind-merge
```

### 5. UIコンポーネントライブラリのセットアップ

UIコンポーネント用の設定ファイルを作成します：

```bash
npx shadcn@latest init
```

プロンプトの選択：
- Which style would you like to use? → Default
- Which color would you like to use as base color? → Neutral
- Would you like to use CSS variables for colors? → Yes

これにより components.json ファイルが作成されます。

### 6. ディレクトリ構造の作成

必要なディレクトリを作成します：

```bash
mkdir -p src/components/ui
mkdir -p src/components/assistant-ui
mkdir -p src/app/api/chat
```

### 7. ディレクトリ構造の確認

プロジェクトの初期構造（これから作成していくファイルを含む）：
```
ai-assistant-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts (これから作成)
│   │   ├── assistant.tsx (これから作成)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── components/
│       ├── assistant-ui/ (これから作成)
│       │   ├── markdown-text.tsx
│       │   ├── thread-list.tsx
│       │   ├── thread.tsx
│       │   └── tooltip-icon-button.tsx
│       └── ui/ (これから作成)
│           ├── button.tsx
│           └── tooltip.tsx
├── public/
├── components.json
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 次のステップ
- [02-basic-chat-ui.md](./02-basic-chat-ui.md) - 基本的なチャットUIの実装