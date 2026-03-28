import { pgTable, text, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

export const leadsTable = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  experienceId: text("experience_id").notNull(),
  experienceSlug: text("experience_slug").notNull(),
  experienceTitle: text("experience_title_snapshot").notNull(),
  channel: text("channel").notNull(), // 'whatsapp', 'email', 'facebook'
  lang: text("lang").notNull(), // 'en', 'es'
  tentativeDate: text("tentative_date"), // ISO date string, nullable
  people: integer("people"), // number of people, nullable
  messageSnapshot: text("message_snapshot"), // what the user wanted to ask/say
  source: text("source"), // page context: "home", "experience-detail", etc.
  status: text("status").notNull().default("new"), // 'new', 'contacted', 'closed', 'discarded'
});

// Validation
const VALID_CHANNELS = ['whatsapp', 'email', 'facebook'] as const;
const VALID_LANGUAGES = ['en', 'es'] as const;
const VALID_STATUSES = ['new', 'contacted', 'closed', 'discarded'] as const;

export const insertLeadSchema = z.object({
  experienceId: z.string().min(1),
  experienceSlug: z.string().min(1),
  experienceTitle: z.string().min(1),
  channel: z.enum(VALID_CHANNELS),
  lang: z.enum(VALID_LANGUAGES),
  tentativeDate: z.string().nullable().optional(),
  people: z.number().int().min(1).max(100).nullable().optional(),
  messageSnapshot: z.string().max(500).nullable().optional(),
  source: z.string().max(100).nullable().optional(),
});

export const updateLeadSchema = insertLeadSchema
  .partial()
  .extend({
    status: z.enum(VALID_STATUSES).optional(),
  })
  .omit({ experienceId: true, experienceSlug: true });

export const selectLeadSchema = insertLeadSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: z.enum(VALID_STATUSES),
});

export type Lead = typeof leadsTable.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type UpdateLead = z.infer<typeof updateLeadSchema>;
