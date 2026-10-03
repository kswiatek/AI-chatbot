// langgraph workflow definition
// startAgentRun and resumeAgentRun

import {
  Annotation,
  Command,
  END,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { validateNode } from "./nodes/01_validate";
import { planNode } from "./nodes/02_plan";
import { approveNode } from "./nodes/03_approve";
import { executeNode } from "./nodes/04_execute";
import { finalizeNode } from "./nodes/05_finalize";
import { makeInitialState, State } from "./types";

const StateAnn = Annotation.Root({
  input: Annotation<string>,
  steps: Annotation<string[] | undefined>,
  approved: Annotation<boolean | undefined>,
  results: Annotation<Array<{ step: string; note: string }> | undefined>,
  status: Annotation<"planned" | "done" | "cancelled" | undefined>,
  message: Annotation<string | undefined>,
});

const builder = new StateGraph(StateAnn)
  .addNode("validate", validateNode)
  .addNode("plan", planNode)
  .addNode("approve", approveNode)
  .addNode("execute", executeNode)
  .addNode("finalize", finalizeNode);

builder.addEdge(START, "validate");
builder.addEdge("validate", "plan");
builder.addEdge("plan", "approve");

builder.addConditionalEdges("approve", (s: typeof StateAnn.State) => {
  return s.approved ? "execute" : "finalize";
});
builder.addEdge("execute", "finalize");
builder.addEdge("finalize", END);

const checkPointer = new MemorySaver();
const graph = builder.compile({
  checkpointer: checkPointer,
});

const createThreadId = () => {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};

export const startAgentRun = async (
  input: string,
): Promise<
  { interrupt: { threadId: string; steps: string[] } } | { final: State }
> => {
  const threadId = createThreadId();
  const config = { configurable: { thread_id: threadId } };
  const result: any = await graph.invoke(makeInitialState(input), config);

  if (result && result.__interrupt__) {
    const first = Array.isArray(result.__interrupt__)
      ? result.__interrupt__[0]
      : result.__interrupt__;
    const steps = (first?.value?.steps as string[]) ?? [];
    return {
      interrupt: {
        threadId,
        steps,
      },
    };
  }
  return {
    final: result as State,
  };
};

export const resumeAgentRun = async (args: {
  threadId: string;
  approve: boolean;
}): Promise<State> => {
  const { threadId, approve } = args;
  const config = { configurable: { thread_id: threadId } };
  const finalState = (await graph.invoke(
    new Command({ resume: { approve } }),
    config,
  )) as State;

  return finalState;
};
