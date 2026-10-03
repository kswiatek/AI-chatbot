import { State } from "../types";

export const validateNode = async (state: State): Promise<Partial<State>> => {
  const raw = state.input ?? "";
  const trimmedInput = raw.trim();

  if (!trimmedInput.length) {
    return {
      status: "cancelled",
      message: "Input is empty. Please provide a proper task to start.",
    };
  }

  const MAX = 300;
  const safeInput =
    trimmedInput.length > MAX
      ? trimmedInput.slice(0, MAX) + "..."
      : trimmedInput;

  return {
    input: safeInput,
  };
};
