import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { experiencesTable, updateExperienceSchema } from "@workspace/db/schema";
import { asc } from "drizzle-orm";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// VITE_ADMIN_PIN is available server-side too (it's just an env var in Node.js)
const ADMIN_PIN = process.env.ADMIN_PIN || process.env.VITE_ADMIN_PIN || "austral2025";

function requireAdminToken(req: Request, res: Response): boolean {
  if (!ADMIN_PIN) {
    res.status(500).json({ error: "ADMIN_PIN environment variable is not set on the server." });
    return false;
  }
  const token = req.headers["x-admin-token"];
  if (!token || token !== ADMIN_PIN) {
    res.status(401).json({ error: "Unauthorized. Invalid or missing admin token." });
    return false;
  }
  return true;
}

// GET /api/experiences — public, ordered by sortOrder
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

// PATCH /api/experiences/:id — admin only, with strict validation
router.patch("/experiences/:id", async (req, res) => {
  if (!requireAdminToken(req, res)) return;

  const { id } = req.params;
  const parsed = updateExperienceSchema.safeParse(req.body);

  if (!parsed.success) {
    // Collect user-friendly error messages
    const issues = parsed.error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    res.status(400).json({
      error: "Validation failed",
      details: issues,
    });
    return;
  }

  try {
    // Verify experience exists first
    const existing = await db
      .select()
      .from(experiencesTable)
      .where(eq(experiencesTable.id, id));

    if (existing.length === 0) {
      res.status(404).json({ error: `Experience '${id}' not found.` });
      return;
    }

    const updates = {
      ...parsed.data,
      updatedAt: new Date(),
    };

    const [updated] = await db
      .update(experiencesTable)
      .set(updates)
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
