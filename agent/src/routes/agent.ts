import { Router } from "express";
import { runProductAgent } from "../agent/03_agent";
import {
  appendToHistory,
  ensureThreadId,
  getHistory,
} from "../agent/04_memory";

export const agentRouter = Router();

agentRouter.post("/chat", async (req, res) => {
  try {
    const { message, threadId: incomingThreadId } = req.body as {
      message?: string;
      threadId?: string;
    };
    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ ok: false, message: "Message is required" });
    }

    const threadId = await ensureThreadId(incomingThreadId);
    const history = await getHistory(threadId);

    const userMessage = {
      role: "user" as const,
      content: message.trim(),
    };

    await appendToHistory(threadId, userMessage);

    const messagesForAgent = [...history, userMessage];
    const { answer, citations } = await runProductAgent(messagesForAgent);

    const assistantMessage = {
      role: "assistant" as const,
      content: answer,
    };

    await appendToHistory(threadId, assistantMessage);

    return res.json({ ok: true, answer, citations, threadId });
  } catch (err: any) {
    console.log("🚀 ~ err:", err);
    return res.status(500).json({ ok: false, message: "Some error occured" });
  }
});
