import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { experiencesTable, updateExperienceSchema } from "@workspace/db/schema";
import { asc, eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/experiences", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(experiencesTable)
      .orderBy(asc(experiencesTable.sortOrder));
    res.json(rows);
  } catch (err) {
    console.error("GET /experiences error:", err);
    res.status(500).json({ error: "Failed to fetch experiences." });
  }
});

router.patch("/experiences/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const parsed = updateExperienceSchema.safeParse(req.body);

  if (!parsed.success) {
    const issues = parsed.error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    res.status(400).json({ error: "Validation failed", details: issues });
    return;
  }

  try {
    const existing = await db
      .select()
      .from(experiencesTable)
      .where(eq(experiencesTable.id, id));

    if (existing.length === 0) {
      res.status(404).json({ error: `Experience '${id}' not found.` });
      return;
    }

    const [updated] = await db
      .update(experiencesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(experiencesTable.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error(`PATCH /experiences/${id} error:`, err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: `Failed to update experience: ${msg}` });
  }
});

export default router;
