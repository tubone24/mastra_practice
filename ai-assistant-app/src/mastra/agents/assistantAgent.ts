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