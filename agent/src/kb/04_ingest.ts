import { Document } from "@langchain/core/documents";
import { getVectorStore } from "./03_vectorStore";

export interface IngestSummar {
  ok: boolean;
  namespace: string;
  totalChunks: number;
  sources: string[];
}

export const ingestDocuments = async (
  namespace: string,
  chunks: Document[],
): Promise<IngestSummar> => {
  if (!namespace) {
    throw new Error("Namespace is required");
  }

  if (!chunks.length) {
    return {
      ok: false,
      namespace,
      totalChunks: 0,
      sources: [],
    };
  }

  const vectorStore = await getVectorStore();
  let currentId = 0;

  const docsWithMeta = chunks.map((chunk) => {
    const source = (chunk.metadata?.source as string) || "unknown_source";
    const doc = new Document({
      pageContent: chunk.pageContent,
      metadata: {
        namespace,
        source,
        chunkId: currentId++,
      },
    });
    return doc;
  });

  await vectorStore.addDocuments(docsWithMeta);
  const sources = Array.from(
    new Set(docsWithMeta.map((d) => d.metadata.source as string)),
  );

  return {
    ok: true,
    namespace,
    totalChunks: docsWithMeta.length,
    sources,
  };
};
