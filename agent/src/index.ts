import "dotenv/config";
import express from "express";
import cors from "cors";
import { searchRouter } from "./routes/search_lcel";
import { kbRouter } from "./routes/light_rag_kb";
import agentRouter from "./routes/graph";
import { env } from "./utils/env";

const app = express();

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
  }),
);

app.use(express.json());

app.use("/search", searchRouter);
app.use("/kb", kbRouter);
app.use("/agent", agentRouter);

const port = env.PORT;
app.listen(port, () => {
  console.log("Server is now running on port " + port);
});
