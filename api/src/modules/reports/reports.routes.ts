import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler.js";
import { getReportsSummary } from "./reports.controller.js";

export const reportsRouter = Router();

reportsRouter.get("/", asyncHandler(getReportsSummary));
