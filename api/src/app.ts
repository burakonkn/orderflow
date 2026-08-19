import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { categoriesRouter } from "./modules/categories/categories.routes.js";
import { productsRouter } from "./modules/products/products.routes.js";

export const app = express();

app.use(express.json());
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);
