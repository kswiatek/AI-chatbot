import "dotenv/config";
import express from "express";
import cors from "cors";
import { searchRouter } from "./routes/search_lcel";
import { kbRouter as lightRagKbRouter } from "./routes/light_rag_kb";
import { kbRouter } from "./routes/kb";
import agentRouter from "./routes/graph";
import { agentRouter as agentRouterV2 } from "./routes/agent";
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
app.use("/lightRagKb", lightRagKbRouter);
app.use("/kb", kbRouter);
app.use("/agent", agentRouter);
app.use("/agent", agentRouterV2);

const port = env.PORT;
app.listen(port, () => {
  console.log("Server is now running on port " + port);
});
