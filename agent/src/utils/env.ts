import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "Api key is needed"),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  GOOGLE_API_KEY: z.string().min(1, "Api key is needed"),
  GEMINI_MODEL: z.string().default("gemini-3.5-flash-lite"),
  PORT: z.string().transform((val) => Number(val)),
  MONGODB_ATLAS_URI: z.string().min(1, "MongoDB atlas URI is required"),
  MONGODB_DB_NAME: z.string().min(1, "MongoDB database name is required"),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error("Error while parsing env");
}

const raw = parsed.data;

export const env = Object.freeze({
  OPENAI_API_KEY: raw.OPENAI_API_KEY,
  OPENAI_MODEL: raw.GOOGLE_API_KEY,
  GEMINI_API_KEY: raw.GOOGLE_API_KEY,
  GEMINI_MODEL: raw.GEMINI_MODEL,
  PORT: raw.PORT,
  MONGODB_ATLAS_URI: raw.MONGODB_ATLAS_URI,
  MONGODB_DB_NAME: raw.MONGODB_DB_NAME,
});
