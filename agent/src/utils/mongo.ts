import { MongoClient, Db } from "mongodb";
import { env } from "./env";

let client: MongoClient | null = null;
let db: Db | null = null;

export const getMongoClient = async (): Promise<MongoClient> => {
  if (client) {
    return client;
  }

  client = new MongoClient(env.MONGODB_ATLAS_URI, {});
  await client.connect();
  console.log("Connected to MongoDB");

  return client;
};

export const getDb = async (): Promise<Db> => {
  if (db) {
    return db;
  }

  const extractMongoClient = await getMongoClient();
  db = extractMongoClient.db(env.MONGODB_DB_NAME);
  console.log("Using current MongoDB DB -> " + env.MONGODB_DB_NAME);

  return db;
};
