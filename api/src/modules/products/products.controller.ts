import { Request, Response } from "express";
import { listProducts, createProduct } from "./products.service.js";
import type { ProductQuery } from "./products.dto.js";

export async function getProducts(req: Request, res: Response) {
  console.log("controller icinde, req.query:", req.query);
  const products = await listProducts(
    res.locals.query as ProductQuery,
  );
  res.json({ ok: true, data: products });
}

export async function postProduct(req: Request, res: Response) {
  const product = await createProduct(req.body);
  res.status(201).json({ ok: true, data: product });
}
