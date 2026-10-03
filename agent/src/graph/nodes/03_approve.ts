// pasue graph and ask human to aprrove steps
// send back to UI threadId and steps

import { State } from "../types";

export const approveNode = async (
  state: State,
  context: any,
): Promise<Partial<State>> => {
  if (state.status === "cancelled") {
    return {};
  }

  const steps = state.steps ?? [];
  if (!steps.length) {
    return {
      approved: true,
      message: "No steps to approve, procedding ->",
    };
  }

  const interrupt = context?.interrupt as (
    payload: unknown,
  ) => Promise<unknown>;
  const decision = await interrupt({
    type: "approval_request",
    steps,
  });

  let approved: boolean;

  if (
    decision &&
    typeof decision === "object" &&
    "approved" in (decision as any)
  ) {
    approved = !!(decision as any).approve;
  } else {
    approved = !!decision;
  }

  return { approved };
};
