import { Router, type IRouter } from "express";
import { GetLunarPhasesQueryParams, GetLunarPhasesResponse } from "@workspace/api-zod";
import { getMonthPhases } from "../lib/lunar";

const router: IRouter = Router();

router.get("/lunar/phases", async (req, res): Promise<void> => {
  const params = GetLunarPhasesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { month, year } = params.data;
  const phases = getMonthPhases(year, month);

  res.json(GetLunarPhasesResponse.parse(phases));
});

export default router;
