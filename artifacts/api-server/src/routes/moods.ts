import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, moodsTable } from "@workspace/db";
import {
  ListMoodsQueryParams,
  ListMoodsResponse,
  CreateMoodBody,
  UpdateMoodParams,
  UpdateMoodBody,
  UpdateMoodResponse,
  DeleteMoodParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { getLunarPhase } from "../lib/lunar";

const router: IRouter = Router();

router.get("/moods", requireAuth, async (req, res): Promise<void> => {
  const params = ListMoodsQueryParams.safeParse(req.query);
  const userId = req.user!.userId;

  let moods;
  if (params.success && params.data.month && params.data.year) {
    const { month, year } = params.data;
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const daysInMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

    const { sql } = await import("drizzle-orm");
    moods = await db
      .select()
      .from(moodsTable)
      .where(
        and(
          eq(moodsTable.userId, userId),
          sql`${moodsTable.date} >= ${startDate}`,
          sql`${moodsTable.date} <= ${endDate}`
        )
      );
  } else {
    moods = await db.select().from(moodsTable).where(eq(moodsTable.userId, userId));
  }

  res.json(ListMoodsResponse.parse(moods));
});

router.post("/moods", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateMoodBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = req.user!.userId;
  const { date, mood, note } = parsed.data;

  const phaseInfo = getLunarPhase(new Date(date + "T12:00:00Z"));

  const [entry] = await db
    .insert(moodsTable)
    .values({ userId, date, mood, note: note ?? null, lunarPhase: phaseInfo.phase })
    .returning();

  res.status(201).json(UpdateMoodResponse.parse(entry));
});

router.patch("/moods/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateMoodParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMoodBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = req.user!.userId;

  const [entry] = await db
    .update(moodsTable)
    .set(parsed.data)
    .where(and(eq(moodsTable.id, params.data.id), eq(moodsTable.userId, userId)))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Mood entry not found" });
    return;
  }

  res.json(UpdateMoodResponse.parse(entry));
});

router.delete("/moods/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteMoodParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = req.user!.userId;

  const [entry] = await db
    .delete(moodsTable)
    .where(and(eq(moodsTable.id, params.data.id), eq(moodsTable.userId, userId)))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Mood entry not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
