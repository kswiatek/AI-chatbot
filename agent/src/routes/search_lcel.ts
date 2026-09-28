import { Router } from "express";
import { SearchInputSchema } from "../utils/schemas";
import { runSearch } from "../search_tool/searchChain";

export const searchRouter = Router();

searchRouter.post("/", async (req, res, next) => {
  try {
    const input = SearchInputSchema.parse(req.body);
    const result = await runSearch(input);
    res.status(200).json(result);
  } catch (err) {
    const errorMessage = (err as Error)?.message ?? "unknown error occured";
    res.status(400).json({ error: errorMessage });
  }
});
