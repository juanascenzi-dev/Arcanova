import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { leadsTable, insertLeadSchema, updateLeadSchema } from "@workspace/db/schema";
import { desc, eq, and } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_PIN = process.env.ADMIN_PIN || process.env.VITE_ADMIN_PIN || "austral2025";

function requireAdminToken(req: Request, res: Response): boolean {
  const token = req.headers["x-admin-token"];
  if (!token || token !== ADMIN_PIN) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

// POST /api/leads — public, capture lead
router.post("/leads", async (req, res) => {
  const parsed = insertLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    res.status(400).json({ error: "Validation failed", details: issues });
    return;
  }

  try {
    const [lead] = await db
      .insert(leadsTable)
      .values(parsed.data)
      .returning();

    res.status(201).json(lead);
  } catch (err) {
    console.error("POST /leads error:", err);
    res.status(500).json({ error: "Failed to create lead" });
  }
});

// GET /api/leads — admin only, list leads with filters
router.get("/leads", async (req, res) => {
  if (!requireAdminToken(req, res)) return;

  try {
    const { status, channel, experienceId, lang } = req.query;

    // Build conditions array
    const conditions: any[] = [];
    
    if (status && typeof status === 'string') {
      conditions.push(eq(leadsTable.status, status));
    }
    if (channel && typeof channel === 'string') {
      conditions.push(eq(leadsTable.channel, channel));
    }
    if (experienceId && typeof experienceId === 'string') {
      conditions.push(eq(leadsTable.experienceId, experienceId));
    }
    if (lang && typeof lang === 'string') {
      conditions.push(eq(leadsTable.lang, lang));
    }

    // Execute query with conditions
    let query = db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const leads = await query;
    res.json(leads);
  } catch (err) {
    console.error("GET /leads error:", err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// GET /api/leads/:id — admin only, get single lead
router.get("/leads/:id", async (req, res) => {
  if (!requireAdminToken(req, res)) return;

  const { id } = req.params;

  try {
    const [lead] = await db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.id, id));

    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }

    res.json(lead);
  } catch (err) {
    console.error(`GET /leads/${id} error:`, err);
    res.status(500).json({ error: "Failed to fetch lead" });
  }
});

// PATCH /api/leads/:id — admin only, update lead status or fields
router.patch("/leads/:id", async (req, res) => {
  if (!requireAdminToken(req, res)) return;

  const { id } = req.params;
  const parsed = updateLeadSchema.safeParse(req.body);

  if (!parsed.success) {
    const issues = parsed.error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    res.status(400).json({ error: "Validation failed", details: issues });
    return;
  }

  try {
    const [lead] = await db
      .update(leadsTable)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(leadsTable.id, id))
      .returning();

    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }

    res.json(lead);
  } catch (err) {
    console.error(`PATCH /leads/${id} error:`, err);
    res.status(500).json({ error: "Failed to update lead" });
  }
});

export default router;
