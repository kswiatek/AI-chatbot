import { createAgent, providerStrategy } from "langchain";
import { z } from "zod";
import { chatModel } from "../utils/gemini";
import { agentTools } from "./02_tools";
import { AGENT_SYSTEM_PROMPT } from "./01_policy";

const AgentResponseSchema = z.object({
  answer: z.string(),
  citations: z.array(
    z.object({
      source: z.string(),
      chunkId: z.number(),
      preview: z.string(),
    }),
  ),
});

export const ProductAgent = createAgent({
  model: chatModel,
  tools: agentTools,
  systemPrompt: AGENT_SYSTEM_PROMPT,
  responseFormat: providerStrategy(AgentResponseSchema),
});

export const runProductAgent = async (
  messages: { role: string; content: string }[],
): Promise<{ answer: string; citations: any[] }> => {
  const result: any = await ProductAgent.invoke({ messages });

  if (result?.structuredResponse) {
    return {
      answer: result?.structuredResponse?.answer,
      citations: result?.structuredResponse?.citations ?? [],
    };
  }
  // in case structuredResponse is not present:
  return {
    answer: "",
    citations: [],
  };
};
