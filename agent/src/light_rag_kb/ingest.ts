// 1. chunk the text using fixed rules
// 2. embed our chunk into vectors
// 3. push our vectors in memory store
// 4. return a summary for UI (e.g. added 1 doc with "many chunks")

import { chunkText } from "./chunk";
import { addChunks } from "./store";

// 2 pipeline:
// ingestion/indexing (preparing knowledge)
// retrival/answer (using knowledge)

// 1 doc will be break into chunks and they will be sources

export type IngestTextInput = {
  text: string;
  sources?: string;
};

export const ingestText = async (input: IngestTextInput) => {
  const raw = (input.text ?? "").trim();

  if (!raw) {
    throw new Error("No file to ingest");
  }

  const source = input.sources ?? "pasted-text";
  const docs = chunkText(raw, source);

  const chunkCount = await addChunks(docs);

  return {
    docCount: 1,
    chunkCount,
    source,
  };
};
