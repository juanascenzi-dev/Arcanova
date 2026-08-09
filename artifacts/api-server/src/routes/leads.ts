import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { leadsTable, insertLeadSchema, updateLeadSchema } from "@workspace/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

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

router.get("/leads", requireAdmin, async (req, res) => {
  try {
    const { status, channel, experienceId, lang } = req.query;
    const conditions: ReturnType<typeof eq>[] = [];

    if (status && typeof status === 'string') conditions.push(eq(leadsTable.status, status));
    if (channel && typeof channel === 'string') conditions.push(eq(leadsTable.channel, channel));
    if (experienceId && typeof experienceId === 'string') conditions.push(eq(leadsTable.experienceId, experienceId));
    if (lang && typeof lang === 'string') conditions.push(eq(leadsTable.lang, lang));

    const leads = await db
      .select()
      .from(leadsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(leadsTable.createdAt));

    res.json(leads);
  } catch (err) {
    console.error("GET /leads error:", err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

router.get("/leads/:id", requireAdmin, async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!id) {
    res.status(400).json({ error: "Lead id is required." });
    return;
  }

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

router.patch("/leads/:id", requireAdmin, async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!id) {
    res.status(400).json({ error: "Lead id is required." });
    return;
  }

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
      .set({ ...parsed.data, updatedAt: new Date() })
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
