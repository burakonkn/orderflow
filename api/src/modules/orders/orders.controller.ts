import { Request, Response } from "express";
import {
  createOrder,
  updateOrderStatus,
  cancelOrder,
  listOrders,
} from "./orders.service.js";

export async function getOrders(req: Request, res: Response) {
  const orders = await listOrders();
  res.json({ ok: true, data: orders });
}

export async function postOrder(req: Request, res: Response) {
  const order = await createOrder(req.body);
  res.status(201).json({ ok: true, data: order });
}

export async function patchOrderStatus(req: Request, res: Response) {
  const orderId = Number(req.params.id);
  const order = await updateOrderStatus(orderId, req.body);
  res.json({ ok: true, data: order });
}

export async function postCancelOrder(req: Request, res: Response) {
  const orderId = Number(req.params.id);
  const order = await cancelOrder(orderId);
  res.json({ ok: true, data: order });
}
