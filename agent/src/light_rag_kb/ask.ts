// ask the knowlendge base (retrieval + answer)
// 1. embed query
// we must use the same embeddings model as we used for indexing the knowlendge base
// 2. retrieve most similar chunks from vector store
// build an answer, prompt, and get final answer from model

import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getChatModel } from "../shared/models";
import { getVectorStore } from "./store";

export type KBSource = {
  source: string;
  chunkId: number;
};

export type KBAskResult = {
  answer: string;
  sources: KBSource[];
  confidence: number; // 0 - 1
};

// 2 chunks
// doc.md nr.0
// doc.md nr.1
const buildContext = (chunks: { text: string; meta: any }[]) => {
  return chunks
    .map(({ text, meta }, i) =>
      [
        `[#${i + 1}] ${String(meta?.source ?? "unknown")} #${String(meta?.chunkId ?? "?")}`,
        text ?? "Empty text",
      ].join("\n"),
    )
    .join("\n\n---\n\n");
};

const buildFinalAnswerFromLLM = async (query: string, context: string) => {
  const model = getChatModel({ temperature: 0.2 });
  const res = await model.invoke([
    new SystemMessage(
      [
        "You are helpful assistant that answers only using the provided context.",
        "If the answer is not found in the current context, say so briefly.",
        "Be concise (4-5 sentences), neutral, and avoid any marketing info.",
        "Do not fabricate sources or cite anyhting that is not in the context.",
      ].join("\n"),
    ),
    new HumanMessage(
      [
        `Question:\n${query}`,
        "",
        "Context: (quoted chunks) ->",
        context || "no relevant context",
      ].join("\n"),
    ),
  ]);

  const finalRes =
    typeof res.content === "string" ? res.content : String(res.content);
  return finalRes.trim().slice(0, 1500);
};

const buildConfidence = (sources: number[]): number => {
  if (!sources.length) {
    return 0;
  }
  const clamped = sources.map((source) => Math.max(0, Math.min(1, source))); // e.g. 0.5
  const avg = clamped.reduce((a, b) => a + b, 0);

  return Math.round(avg * 100) / 100; // 2 decimal places
};

export const askKB = async (query: string, k = 2): Promise<KBAskResult> => {
  const validateCurrentQuery = (query ?? "").trim();
  if (!validateCurrentQuery) {
    throw new Error("Query is empty");
  }

  const store = getVectorStore();

  // embed the query
  const embedQuery = await store.embeddings.embedQuery(validateCurrentQuery);

  // pairs look like this:
  // [ [Document  {pageContent, metadata}], [...] ]

  const pairs = await store.similaritySearchVectorWithScore(embedQuery, k);
  const chunks = pairs.map(([doc]) => ({
    text: doc.pageContent || "",
    meta: doc.metadata || {},
  }));

  const scores = pairs.map(([__dirname, score]) => Number(score) || 0);

  // prompt ctx
  const context = buildContext(chunks);
  const answer = await buildFinalAnswerFromLLM(validateCurrentQuery, context);
  const sources: KBSource[] = chunks.map((chunk) => ({
    source: String(chunk.meta?.source ?? "unknown"),
    chunkId: Number(chunk.meta?.chunkId) ?? 0,
  }));

  const confidence = buildConfidence(scores);

  return {
    answer,
    sources,
    confidence,
  };
};
