import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getChatModel } from "../shared/models";
import { SummarizeInputSchema, SummarizeOutputSchema } from "./schemas";

const clip = (text: string, max: number) => {
  return text.length > max ? text.slice(0, max) : text;
};

const normalizeSummary = (s: string) => {
  const t = s
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return t.slice(0, 2500);
};

export const summarize = async (text: string) => {
  const { text: raw } = SummarizeInputSchema.parse({ text });

  const clipped = clip(raw, 4000);

  const model = getChatModel({ temperature: 0.2 });

  const res = await model.invoke([
    new SystemMessage(
      [
        "You are a helpful assistant that writes short and accurate summaries.",
        "Guidelines:",
        "- Be factual and neutral, avoid marketing language.",
        "- 5-8 sentences; no lists unless absolutely  necessarry.",
        "- Do NOT invent sources; you only summarize the provided text.",
        "- Keep it readable for beginners.",
      ].join("\n"),
    ),
    new HumanMessage(
      [
        "summarize the following content for a beginner friendly audience",
        "Focus on key facts and remove fluff",
        "TEXT: ",
        clipped,
      ].join("\n\n"),
    ),
  ]);

  const rawModelOutput =
    typeof res.content === "string" ? res.content : String(res.content);

  const summary = normalizeSummary(rawModelOutput);
  return SummarizeOutputSchema.parse({ summary });
};
