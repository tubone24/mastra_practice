# 04. Next.jsへの統合

## 概要
このドキュメントでは、Mastraで作成したエージェントとツールをNext.jsアプリケーションに統合し、Webインターフェースから利用できるようにします。

## 前提
- Mastraエージェントとツールが動作していること
- Mastra Playgroundで動作確認済みであること

## 手順

### 1. Next.jsプロジェクトのセットアップ

現在のプロジェクトをNext.jsプロジェクトに変換します：

```bash
# Next.js関連の依存関係をインストール
npm install next react react-dom
npm install -D @types/react @types/react-dom

# Tailwind CSSのインストール
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Next.js設定ファイルの作成

next.config.js を作成：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@mastra/*"],
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

### 3. プロジェクト構造の調整

```bash
# pagesディレクトリをappディレクトリに変更
mkdir -p app/api/chat
mkdir -p components/ui
mkdir -p components/assistant-ui
```

### 4. Tailwind CSS設定

tailwind.config.js を更新：

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

app/globals.css を作成：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. Assistant UIコンポーネントの作成

components/ui/button.tsx を作成：

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "h-10 px-4 py-2",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
```

### 6. チャットAPIルートの作成

app/api/chat/route.ts を作成：

```typescript
import { mastra } from "@/src/mastra";
import { StreamingTextResponse } from "ai";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const agent = mastra.getAgent("assistantAgent");
    if (!agent) {
      throw new Error("Agent not found");
    }

    // エージェントでストリーミング応答を生成
    const stream = await agent.stream(messages);
    
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
```

### 7. チャットコンポーネントの作成

components/assistant-ui/chat.tsx を作成：

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Chat() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantMessage = { role: "assistant", content: "" };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage.content += chunk;
        
        setMessages([...messages, userMessage, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 p-4 rounded-lg ${
              message.role === "user"
                ? "bg-blue-100 ml-auto max-w-xs"
                : "bg-gray-100 mr-auto max-w-md"
            }`}
          >
            <p className="text-sm font-semibold mb-1">
              {message.role === "user" ? "You" : "Assistant"}
            </p>
            <p className="text-sm">{message.content}</p>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 p-2 border rounded-lg"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "送信中..." : "送信"}
        </Button>
      </form>
    </div>
  );
}
```

### 8. メインページの作成

app/page.tsx を作成：

```typescript
import { Chat } from "@/components/assistant-ui/chat";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Chat />
    </main>
  );
}
```

### 9. レイアウトの作成

app/layout.tsx を作成：

```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Assistant App",
  description: "Mastra-powered AI Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

### 10. package.jsonスクリプトの更新

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "mastra:dev": "mastra dev"
  }
}
```

### 11. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いて、チャットインターフェースを確認します。

## 動作確認

1. メッセージを入力して送信
2. Mastraエージェントからの応答を確認
3. Web検索が必要な質問をして、ツールの動作を確認

## トラブルシューティング

### モジュールが見つからないエラー
```bash
# クリーンインストール
rm -rf node_modules package-lock.json
npm install
```

### TypeScriptエラー
tsconfig.json を以下のように更新：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## 次のステップ
- [05-advanced-ui.md](./05-advanced-ui.md) - 高度なUIの実装