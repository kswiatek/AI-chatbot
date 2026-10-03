// define state that flows through the langgraph
// graph = state + nodes + edges

import { z } from "zod";

// planned - plan is ready but not approved
// done - task done, final result is prepared
// cancelled - user rejected the flow, we stop gracefully
export const ExecutionStatus = z.enum(["planned", "done", "cancelled"]);
export type ExecutionStatus = z.infer<typeof ExecutionStatus>;

// each step can produce a short human readable outcome
export const StepResult = z.object({
  step: z.string(),
  note: z.string(),
});

// state
export const StateSchema = z.object({
  input: z.string().min(3, "input is required"),
  steps: z.array(z.string()).optional(),
  approved: z.boolean().optional(),
  results: z.array(StepResult).optional(),
  status: ExecutionStatus.optional(),
  message: z.string().optional(),
});

export type State = z.infer<typeof StateSchema>;

export const makeInitialState = (input: string): State => {
  return {
    input,
    status: "planned",
  };
};
