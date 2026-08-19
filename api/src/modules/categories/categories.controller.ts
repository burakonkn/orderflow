// HTTP isteğini alır, servisi çağırır, cevap döner
import { Request, Response } from "express";
import { listCategories, createCategory } from "./categories.service.js";

export async function getCategories(req: Request, res: Response) {
  const categories = await listCategories();
  res.json({ ok: true, data: categories });
}

export async function postCategory(req: Request, res: Response) {
  const category = await createCategory(req.body);
  res.status(201).json({ ok: true, data: category });
}
