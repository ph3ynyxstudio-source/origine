import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, type User } from "@workspace/db";
import { UpdateProfileBody, UpdateProfileResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.patch("/user/profile", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = req.user!.userId;

  const updateData: Partial<Pick<User, "consumptionLabel">> = {};
  if (parsed.data.consumptionLabel !== undefined) {
    updateData.consumptionLabel = parsed.data.consumptionLabel;
  }

  if (Object.keys(updateData).length === 0) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(UpdateProfileResponse.parse({
      id: user.id,
      username: user.username,
      consumptionLabel: user.consumptionLabel,
    }));
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, userId))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(UpdateProfileResponse.parse({
    id: user.id,
    username: user.username,
    consumptionLabel: user.consumptionLabel,
  }));
});

export default router;
