// embeddings and vector store
// kb - knowledge base
// embedding model from env openai | gemini (embedding is turning data into array of numbers)

import { TaskType } from "@google/generative-ai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { OpenAIEmbeddings } from "@langchain/openai";

type Provider = "openai" | "google";

const getProvider = (): Provider => {
  const getCurrentProvider = (
    process.env.RAG_MODEL_PROVIDER ?? "gemini"
  ).toLowerCase();
  return getCurrentProvider === "gemini" ? "google" : "openai";
};

// create embeddings client
const makeOpenAiEmbeddings = () => {
  const key = process.env.OPENAI_API_KEY ?? "";
  if (!key) {
    throw new Error("Openai api key is missing");
  }
  return new OpenAIEmbeddings({
    apiKey: key,
    model: "text-embedding-3-small",
  });
};

const makeGoogleEmbeddings = () => {
  const key = process.env.GOOGLE_API_KEY ?? "";
  if (!key) {
    throw new Error("Google api key is missing");
  }
  return new GoogleGenerativeAIEmbeddings({
    apiKey: key,
    model: "gemini-embedding-001",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
  });
};

const makeEmbeddings = (provider: Provider) => {
  return provider === "google"
    ? makeGoogleEmbeddings()
    : makeOpenAiEmbeddings();
};

// vector store

let store: MemoryVectorStore | null = null;
let currentSetProvider: Provider | null = null;

export const getVectorStore = (): MemoryVectorStore => {
  const provider = getProvider();

  if (store && currentSetProvider == provider) {
    return store;
  }

  // provider changed or 1st time call - build new provider
  store = new MemoryVectorStore(makeEmbeddings(provider));
  currentSetProvider = provider;

  return store;
};

export const addChunks = async (docs: Document[]): Promise<number> => {
  if (!Array.isArray(docs) || docs.length === 0) {
    return 0;
  }
  const store = getVectorStore();

  await store.addDocuments(docs);

  return docs.length;
};

export const resetStore = () => {
  store = null;
  currentSetProvider = null;
};
