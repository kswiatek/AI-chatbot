// fetch pages
// LLM cannot browse teh web on its own
// this code will act as a browser tool
// we decide here what content is ok to show by the model

import { convert } from "html-to-text";
import { OpenUrlOutputSchema } from "./schemas";

const safeText = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return "<no body>";
  }
};

const collapseWhitespace = (text: string) => {
  return text.replace(/\s+/g, " ").trim();
};

const validateUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) {
      throw new Error("Only http or https are supported");
    }

    return parsed.toString();
  } catch {
    throw new Error("Invalid url");
  }
};

export const openUrl = async (url: string) => {
  //step1 check URL
  const normalized = validateUrl(url);

  //step2 fetch page
  const res = await fetch(normalized, {
    headers: {
      "User-Agent": "agent-core/1.0 (+course-demo)",
    },
  });

  if (!res.ok) {
    const body = await safeText(res);
    throw new Error(`OpenURL failed ${res.status} - ${body.slice(0, 200)}`);
  }

  // step3
  const contentType = res.headers.get("content-type") ?? "";
  const raw = await res.text();

  // step4 transform html to plain text
  const text = contentType.includes("text/html")
    ? convert(raw, {
        wordwrap: false,
        selectors: [
          {
            selector: "nav",
            format: "skip",
          },
          {
            selector: "header",
            format: "skip",
          },
          {
            selector: "footer",
            format: "skip",
          },
          {
            selector: "script",
            format: "skip",
          },
          {
            selector: "style",
            format: "skip",
          },
        ],
      })
    : raw;

  // step5
  const cleaned = collapseWhitespace(text);
  const capped = cleaned.slice(0, 8000);

  return OpenUrlOutputSchema.parse({
    url: normalized,
    content: capped,
  });
};
