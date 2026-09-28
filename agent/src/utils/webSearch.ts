// search the internet tool
// u give it a natural lang query (from user)
// it calls Tavily
// it returns array of search hits (schema)

import { env } from "../shared/env";
import { WebSearchResultSchema, WebSearchResultsSchema } from "./schemas";

const safeText = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return "<no body>";
  }
};

const searchTavilyUtil = async (query: string) => {
  if (!env.TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY is missing");
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      search_depth: "basic",
      max_results: 5,
      include_answer: false,
      include_images: false,
    }),
  });

  if (!response.ok) {
    const text = await safeText(response);
    throw new Error(`Tavily error, ${response.status} - ${text}`);
  }

  const data = await response.json();
  const results = Array.isArray(data?.results) ? data.results : [];
  const normalized = results.slice(0, 5).map((r: any) =>
    WebSearchResultSchema.parse({
      title: String(r.title ?? "").trim() || "Untitled",
      url: String(r.url ?? "").trim(),
      snippet: String(r.content ?? "")
        .trim()
        .slice(0, 200),
    }),
  );

  return WebSearchResultsSchema.parse(normalized);
};

export const webSearch = async (q: string) => {
  const query = (q ?? "").trim();
  if (!query) {
    return [];
  }

  return await searchTavilyUtil(query);
};
