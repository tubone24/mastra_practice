# 05. 高度なUIの実装

## 概要
このドキュメントでは、Assistant UIライブラリを使用して、より洗練されたチャットインターフェースを実装します。

## Assistant UIの導入

### 1. Assistant UI依存関係のインストール

```bash
npm install @assistant-ui/react @assistant-ui/react-ai-sdk @assistant-ui/react-markdown
npm install remark-gfm
```

### 2. Assistant UIプロバイダーの設定

app/providers.tsx を作成：

```typescript
"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const runtime = useChatRuntime({
    api: "/api/chat",
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
```

### 3. レイアウトの更新

app/layout.tsx を更新：

```typescript
import type { Metadata } from "next";
import { Providers } from "./providers";
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 4. 高度なチャットコンポーネント

components/assistant-ui/thread.tsx を作成：

```typescript
"use client";

import { Thread as ThreadPrimitive } from "@assistant-ui/react";
import { MarkdownText } from "./markdown-text";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

export function Thread() {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col bg-white">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-4">
        <ThreadPrimitive.Messages>
          <ThreadPrimitive.UserMessage className="mb-4 flex justify-end">
            <div className="max-w-[80%] rounded-lg bg-blue-500 px-4 py-2 text-white">
              <ThreadPrimitive.MessageContent />
            </div>
          </ThreadPrimitive.UserMessage>

          <ThreadPrimitive.AssistantMessage className="mb-4 flex justify-start">
            <div className="max-w-[80%] rounded-lg bg-gray-100 px-4 py-2">
              <ThreadPrimitive.MessageContent>
                <MarkdownText />
              </ThreadPrimitive.MessageContent>
            </div>
          </ThreadPrimitive.AssistantMessage>
        </ThreadPrimitive.Messages>
      </ThreadPrimitive.Viewport>

      <div className="border-t p-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex gap-2">
            <ThreadPrimitive.Composer className="flex-1">
              <ThreadPrimitive.ComposerInput
                placeholder="メッセージを入力..."
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </ThreadPrimitive.Composer>
            
            <ThreadPrimitive.ComposerSend asChild>
              <Button size="icon">
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </ThreadPrimitive.ComposerSend>
          </div>
        </div>
      </div>
    </ThreadPrimitive.Root>
  );
}
```

### 5. Markdownサポート

components/assistant-ui/markdown-text.tsx を作成：

```typescript
"use client";

import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function MarkdownText() {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ className, ...props }) => (
          <p className={cn("mb-2 last:mb-0", className)} {...props} />
        ),
        h1: ({ className, ...props }) => (
          <h1 className={cn("mb-4 text-2xl font-bold", className)} {...props} />
        ),
        h2: ({ className, ...props }) => (
          <h2 className={cn("mb-3 text-xl font-semibold", className)} {...props} />
        ),
        h3: ({ className, ...props }) => (
          <h3 className={cn("mb-2 text-lg font-medium", className)} {...props} />
        ),
        ul: ({ className, ...props }) => (
          <ul className={cn("mb-2 list-disc pl-5", className)} {...props} />
        ),
        ol: ({ className, ...props }) => (
          <ol className={cn("mb-2 list-decimal pl-5", className)} {...props} />
        ),
        li: ({ className, ...props }) => (
          <li className={cn("mb-1", className)} {...props} />
        ),
        code: ({ className, inline, ...props }) => {
          if (inline) {
            return (
              <code
                className={cn(
                  "rounded bg-gray-100 px-1 py-0.5 font-mono text-sm",
                  className
                )}
                {...props}
              />
            );
          }
          return (
            <code
              className={cn(
                "block rounded bg-gray-100 p-2 font-mono text-sm",
                className
              )}
              {...props}
            />
          );
        },
        pre: ({ className, ...props }) => (
          <pre
            className={cn("mb-2 overflow-x-auto rounded bg-gray-100 p-4", className)}
            {...props}
          />
        ),
        blockquote: ({ className, ...props }) => (
          <blockquote
            className={cn("mb-2 border-l-4 border-gray-300 pl-4 italic", className)}
            {...props}
          />
        ),
      }}
    />
  );
}
```

### 6. ユーティリティ関数

lib/utils.ts を作成：

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 7. メインページの更新

app/page.tsx を更新：

```typescript
import { Thread } from "@/components/assistant-ui/thread";

export default function Home() {
  return (
    <main className="h-screen">
      <div className="mx-auto h-full max-w-4xl">
        <Thread />
      </div>
    </main>
  );
}
```

### 8. APIルートの更新

app/api/chat/route.ts を更新してAssistant UI形式に対応：

```typescript
import { mastra } from "@/src/mastra";
import { toDataStreamResponse } from "ai";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const agent = mastra.getAgent("assistantAgent");
    if (!agent) {
      throw new Error("Agent not found");
    }

    const stream = await agent.stream(messages);
    
    // Assistant UI用のデータストリーム形式に変換
    return toDataStreamResponse(stream);
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
```

## 高度な機能の実装

### 1. スレッド管理

components/assistant-ui/thread-list.tsx を作成：

```typescript
"use client";

import { ThreadList as ThreadListPrimitive } from "@assistant-ui/react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function ThreadList() {
  return (
    <div className="w-64 border-r bg-gray-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">チャット履歴</h2>
        <ThreadListPrimitive.NewThread asChild>
          <Button size="sm" variant="ghost">
            <Plus className="h-4 w-4" />
          </Button>
        </ThreadListPrimitive.NewThread>
      </div>
      
      <ThreadListPrimitive.Root>
        <ThreadListPrimitive.Thread className="mb-2 rounded p-2 hover:bg-gray-100 cursor-pointer">
          <ThreadListPrimitive.ThreadTitle className="font-medium" />
          <ThreadListPrimitive.ThreadPreview className="text-sm text-gray-600" />
        </ThreadListPrimitive.Thread>
      </ThreadListPrimitive.Root>
    </div>
  );
}
```

### 2. ツール呼び出しの可視化

ツールが呼び出された時の表示：

```typescript
<ThreadPrimitive.ToolCallsContent>
  <div className="my-2 rounded border border-blue-200 bg-blue-50 p-3">
    <p className="text-sm font-medium text-blue-700">🔧 ツールを実行中...</p>
    <ThreadPrimitive.ToolCallName className="text-sm text-gray-600" />
  </div>
</ThreadPrimitive.ToolCallsContent>
```

### 3. エラーハンドリング

```typescript
<ThreadPrimitive.ErrorBoundary fallback={
  <div className="rounded border border-red-200 bg-red-50 p-4">
    <p className="text-red-700">エラーが発生しました。もう一度お試しください。</p>
  </div>
}>
  {/* コンテンツ */}
</ThreadPrimitive.ErrorBoundary>
```

## スタイリングのカスタマイズ

### ダークモード対応

```css
@media (prefers-color-scheme: dark) {
  .dark\:bg-gray-800 {
    background-color: rgb(31 41 55);
  }
  
  .dark\:text-white {
    color: white;
  }
}
```

### アニメーション

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## パフォーマンス最適化

1. **メッセージの仮想化**: 大量のメッセージがある場合
2. **画像の遅延読み込み**: メディアコンテンツの最適化
3. **WebSocket接続**: リアルタイム更新の実装

## 次のステップ
- [06-deployment.md](./06-deployment.md) - AWS Amplifyへのデプロイ