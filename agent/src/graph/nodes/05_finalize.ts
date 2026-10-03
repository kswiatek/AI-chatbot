import { State } from "../types";

export const finalizeNode = async (state: State): Promise<Partial<State>> => {
  const approved = state.approved ?? false;
  const results = state.results ?? [];
  const steps = state.steps ?? [];
  const currrentStatus = state.status;

  let status: State["status"];

  if (currrentStatus === "cancelled" || approved === false) {
    status = "cancelled";
  } else {
    status = "done";
  }

  let message: string;
  if (status === "cancelled") {
    message =
      state.message ??
      (steps.length
        ? "User rejected the plan. Nothing executed."
        : "Cancelled before starting.");
  } else {
    message =
      state.message ??
      (results.length
        ? `Completed ${results.length} steps.`
        : steps.length
          ? "Plan is approved. No execution notes were generated."
          : "Finished.");
  }

  return {
    status,
    message,
    steps,
    results,
  };
};
