// why we chunk
// it searches chunk of the text
// chunk should be small enough, and only big enough to contain full idea

import { Document } from "@langchain/core/documents";

export const CHUNK_SIZE = 1000;
export const CHUNK_OVERPAL = 150;

/**
 * text - markdown, article, policy
 * sources - which source had the answer
 */
export const chunkText = (text: string, source: string): Document[] => {
  const clean = (text ?? "").replace(/\r\n/g, "\n");

  const docs: Document[] = [];

  if (!clean.trim()) {
    return docs;
  }

  const step = Math.max(1, CHUNK_SIZE - CHUNK_OVERPAL);

  let start = 0;
  let chunkId = 0;

  while (start < clean.length) {
    const end = Math.min(clean.length, start + CHUNK_SIZE);
    const slice = clean.slice(start, end).trim();
    if (slice.length > 0) {
      docs.push(
        new Document({
          pageContent: slice,
          metadata: {
            source,
            chunkId,
          },
        }),
      );

      chunkId += 1;
    }
    start += step;
  }
  return docs;
};
