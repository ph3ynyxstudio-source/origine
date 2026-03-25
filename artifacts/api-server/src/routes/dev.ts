import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, moodsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { getLunarPhase } from "../lib/lunar";

const router: IRouter = Router();

if (process.env.NODE_ENV === "production") {
  router.all("/dev/*", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
}

const PERIODS = ["morning", "afternoon", "evening"] as const;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomEnergy(): number {
  const steps = [0, 25, 50, 75, 100];
  return steps[randomInt(0, steps.length - 1)];
}

router.post("/dev/seed", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;

  await db.delete(moodsTable).where(eq(moodsTable.userId, userId));

  const today = new Date();
  const entries: Array<{
    userId: number;
    date: string;
    period: "morning" | "afternoon" | "evening";
    mood: number;
    energy: number;
    consumption: number;
    note: string | null;
    lunarPhase: string;
  }> = [];

  for (let daysAgo = 60; daysAgo >= 0; daysAgo--) {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const phaseInfo = getLunarPhase(new Date(dateStr + "T12:00:00Z"));

    const skipChance = Math.random();
    if (skipChance < 0.08) continue;

    for (const period of PERIODS) {
      if (Math.random() < 0.12) continue;

      let baseMood = randomInt(2, 4);
      if (phaseInfo.phase === "full_moon") baseMood = Math.min(5, baseMood + 1);
      if (phaseInfo.phase === "new_moon") baseMood = Math.max(1, baseMood - 1);
      const mood = Math.max(1, Math.min(5, baseMood + (Math.random() > 0.7 ? randomInt(-1, 1) : 0)));

      let baseEnergy = randomEnergy();
      if (period === "morning") baseEnergy = Math.min(100, baseEnergy + 25);
      if (period === "evening") baseEnergy = Math.max(0, baseEnergy - 25);

      const consumption = randomInt(0, 5);

      entries.push({
        userId,
        date: dateStr,
        period,
        mood,
        energy: baseEnergy,
        consumption,
        note: null,
        lunarPhase: phaseInfo.phase,
      });
    }
  }

  if (entries.length > 0) {
    const batchSize = 50;
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      await db.insert(moodsTable).values(batch);
    }
  }

  res.json({ message: "Test data generated", count: entries.length });
});

router.delete("/dev/seed", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;
  const deleted = await db.delete(moodsTable).where(eq(moodsTable.userId, userId)).returning();
  res.json({ message: "All mood data cleared", count: deleted.length });
});

export default router;
