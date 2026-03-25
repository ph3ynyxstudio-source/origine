import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, moodsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

const PHASE_ORDER = [
  "new_moon",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full_moon",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent",
];

router.get("/stats", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;

  const allMoods = await db
    .select()
    .from(moodsTable)
    .where(eq(moodsTable.userId, userId));

  if (allMoods.length === 0) {
    res.json({ byPhase: [], monthlyTrends: [], totalEntries: 0 });
    return;
  }

  const phaseAgg: Record<string, { moodSum: number; energySum: number; consumptionSum: number; count: number }> = {};
  for (const phase of PHASE_ORDER) {
    phaseAgg[phase] = { moodSum: 0, energySum: 0, consumptionSum: 0, count: 0 };
  }

  const monthAgg: Record<string, { moodSum: number; energySum: number; consumptionSum: number; count: number }> = {};

  for (const mood of allMoods) {
    const phase = mood.lunarPhase || "new_moon";
    if (phaseAgg[phase]) {
      phaseAgg[phase].moodSum += mood.mood;
      phaseAgg[phase].energySum += (mood.energy ?? 50);
      phaseAgg[phase].consumptionSum += (mood.consumption ?? 0);
      phaseAgg[phase].count += 1;
    }

    const monthKey = mood.date.substring(0, 7);
    if (!monthAgg[monthKey]) {
      monthAgg[monthKey] = { moodSum: 0, energySum: 0, consumptionSum: 0, count: 0 };
    }
    monthAgg[monthKey].moodSum += mood.mood;
    monthAgg[monthKey].energySum += (mood.energy ?? 50);
    monthAgg[monthKey].consumptionSum += (mood.consumption ?? 0);
    monthAgg[monthKey].count += 1;
  }

  const byPhase = PHASE_ORDER.map((phase) => {
    const agg = phaseAgg[phase];
    if (agg.count === 0) {
      return { phase, avgMood: 0, avgEnergy: 0, avgConsumption: 0, count: 0 };
    }
    return {
      phase,
      avgMood: Math.round((agg.moodSum / agg.count) * 10) / 10,
      avgEnergy: Math.round(agg.energySum / agg.count),
      avgConsumption: Math.round((agg.consumptionSum / agg.count) * 10) / 10,
      count: agg.count,
    };
  });

  const sortedMonths = Object.keys(monthAgg).sort();
  const recentMonths = sortedMonths.slice(-6);
  const monthlyTrends = recentMonths.map((month) => {
    const agg = monthAgg[month];
    return {
      month,
      avgMood: Math.round((agg.moodSum / agg.count) * 10) / 10,
      avgEnergy: Math.round(agg.energySum / agg.count),
      avgConsumption: Math.round((agg.consumptionSum / agg.count) * 10) / 10,
      count: agg.count,
    };
  });

  res.json({
    byPhase,
    monthlyTrends,
    totalEntries: allMoods.length,
  });
});

export default router;
