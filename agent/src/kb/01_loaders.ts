// loading raw file (intu Document[])
// break it into meaningful chunks
// embed (map every chunk to vector)
// store vectors + metadata in vector DB (mongo)
// retrive (fetch relevant chunks for every query)
// generate LLM answers using only retrived chunks based on context

import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";

export type SupportedMime = "application/pdf" | "text/markdown" | "text/plain";

interface LoadFileArgs {
  filePath: string;
  mimeType: SupportedMime;
  originalName: string;
}

const getExt = (name: string): string => {
  const index = name.lastIndexOf(".");
  return index === -1 ? "" : name.slice(index + 1).toLowerCase();
};

export const loadFileAsDocuments = async (
  args: LoadFileArgs,
): Promise<Document[]> => {
  const { filePath, mimeType, originalName } = args;

  const extractExt = getExt(originalName);

  const isMarkdown =
    mimeType === "text/markdown" ||
    extractExt === "md" ||
    extractExt === "markdown";
  const isText = mimeType === "text/plain" || extractExt === "txt";
  const isPdf = mimeType === "application/pdf" || extractExt === "pdf";

  let loader;

  if (isPdf) {
    loader = new PDFLoader(filePath);
  } else if (isText || isMarkdown) {
    loader = new TextLoader(filePath);
  } else {
    return [];
  }

  const docs = await loader.load();

  return docs.map((doc) => ({
    ...doc,
    metadata: {
      ...doc.metadata,
      source: originalName,
    },
  }));
};
