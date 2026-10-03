import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { State } from "../types";
import { env } from "../../utils/env";

const PlanSchema = z.object({
  steps: z
    .array(
      z
        .string()
        .min(3, "Keep each step a short sentence")
        .max(150, "Keep each step concise"),
    )
    .min(1)
    .max(10),
});

type Plan = z.infer<typeof PlanSchema>;

const makeModel = () => {
  // return new ChatOpenAI({
  return new ChatGoogleGenerativeAI({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    temperature: 0.2,
  });
};

const SYSTEM = [
  "You are a helpful planner.",
  "Return only JSON that matches the schema.",
  "Keep steps concrete, actionable and beginner friendly",
].join("\n");

const userPrompt = (input: string) => {
  return [
    `User goal: "${input}"`,
    "Draft a small plan with 3-5 steps",
    "- Each step is a short sentence",
  ].join("\n");
};

const takeFirstN = (arr: string[], n = 5): string[] => {
  return Array.isArray(arr) ? arr.slice(0, Math.max(0, n)) : [];
};

export const planNode = async (state: State): Promise<Partial<State>> => {
  if (state.status === "cancelled") {
    return {};
  }
  const model = makeModel();

  const structured = model.withStructuredOutput(PlanSchema);
  const plan = await structured.invoke([
    {
      role: "system",
      content: SYSTEM,
    },
    { role: "human", content: userPrompt(state.input) },
  ]);

  const steps = takeFirstN(plan.steps, 5);

  return {
    steps,
    status: "planned",
  };
};
