import { Request, Response } from "express";
import {
  getSummaryReport,
  getTopProducts,
  getCityDistribution,
} from "./reports.service.js";

export async function getReportsSummary(req: Request, res: Response) {
  const [summary, topProducts, cityDistribution] = await Promise.all([
    getSummaryReport(),
    getTopProducts(),
    getCityDistribution(),
  ]);

  res.json({ ok: true, data: { summary, topProducts, cityDistribution } });
}
