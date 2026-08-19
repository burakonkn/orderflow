import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);
