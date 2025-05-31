import { mastra } from "@/mastra";

// MastraはNode.jsランタイムが必要
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const agent = mastra.getAgent("assistantAgent");
  
  if (!agent) {
    throw new Error("Agent not found");
  }

  const stream = await agent.stream(messages);
  return stream.toDataStreamResponse();
}
