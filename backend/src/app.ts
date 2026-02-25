import express from "express";
import cors from "cors";
import morgan from "morgan";

import { router as engineRouter } from "./routes/engineRoutes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", engineRouter);

  return app;
}

