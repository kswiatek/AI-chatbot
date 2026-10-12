// const makeOpenAiEmbeddings = () => {
//   const key = process.env.OPENAI_API_KEY ?? "";
//   if (!key) {
//     throw new Error("Openai api key is missing");
//   }
//   return new OpenAIEmbeddings({
//     apiKey: key,
//     model: "text-embedding-3-small",
//   });
// };

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { env } from "./env";

export const chatModel = new ChatGoogleGenerativeAI({
  model: env.GEMINI_MODEL,
  temperature: 0.2,
  apiKey: env.GEMINI_API_KEY,
});

export const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: env.GEMINI_API_KEY,
  model: "gemini-embedding-001",
  //   taskType: TaskType.RETRIEVAL_DOCUMENT,
});
