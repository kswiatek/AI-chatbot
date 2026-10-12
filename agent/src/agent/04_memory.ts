import { Collection, WithId } from "mongodb";
import { getDb } from "../utils/mongo";
import { nanoid } from "nanoid";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp?: Date;
}

export interface ConversationDoc {
  threadId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const CONVERSATIONS_COLLECTION = "conversations";

let conversationCollectionPromise: Promise<Collection<ConversationDoc>> | null =
  null;

const getConversationsCollection = async (): Promise<
  Collection<ConversationDoc>
> => {
  if (!conversationCollectionPromise) {
    conversationCollectionPromise = (async () => {
      const db = await getDb();
      const col = db.collection<ConversationDoc>(CONVERSATIONS_COLLECTION);

      await col.createIndex({ threadId: 1 }, { unique: true });

      return col;
    })();
  }

  return conversationCollectionPromise;
};

export const ensureThreadId = async (
  presentThreadId?: string,
): Promise<string> => {
  const col = await getConversationsCollection();

  if (presentThreadId) {
    const existing = await col.findOne({ threadId: presentThreadId });
    if (existing) {
      return presentThreadId;
    }
  }

  const threadId = nanoid(12);
  const now = new Date();
  await col.insertOne({
    threadId,
    messages: [],
    createdAt: now,
    updatedAt: now,
  });

  return threadId;
};

export const getHistory = async (threadId: string): Promise<ChatMessage[]> => {
  const col = await getConversationsCollection();
  const conv: WithId<ConversationDoc> | null = await col.findOne({ threadId });

  if (!conv) {
    return [];
  }
  return conv.messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
  }));
};

export const appendToHistory = async (
  threadId: string,
  ...messages: ChatMessage[]
): Promise<void> => {
  if (!messages.length) {
    return;
  }

  const col = await getConversationsCollection();
  const messagesWithTimestamp = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp ?? new Date(),
  }));

  await col.updateOne(
    { threadId },
    {
      $push: {
        messages: {
          $each: messagesWithTimestamp,
        },
      },
      $set: {
        updatedAt: new Date(),
      },
    },
  );
};
