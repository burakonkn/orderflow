import { Request, Response } from "express";
import { listCustomers, createCustomer } from "./customers.service.js";

export async function getCustomers(req: Request, res: Response) {
  const customers = await listCustomers();
  return res.json({
    ok: true,
    data: customers,
  });
}

export async function postCustomer(req: Request, res: Response) {
  const createdCustomer = await createCustomer(req.body);
  return res.status(201).json({ ok: true, data: createdCustomer });
}
