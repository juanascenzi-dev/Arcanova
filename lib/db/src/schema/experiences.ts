import { pgTable, text, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

// I18n fields use jsonb with Record<string, V> so new languages (it, fr, etc.)
// can be added without schema migrations — just populate the new key in the JSON.
export type I18nText = Record<string, string>;           // { en: "...", es: "..." }
export type I18nList = Record<string, string[]>;         // { en: [...], es: [...] }

export const experiencesTable = pgTable("experiences", {
  id:            text("id").primaryKey(),               // semantic: 'yacht', 'atv', etc.
  sortOrder:     integer("sort_order").notNull().default(0),
  visible:       boolean("visible").notNull().default(true),
  tagType:       text("tag_type").notNull(),
  category:      jsonb("category").$type<string[]>().notNull(),
  imageUrl:      text("image_url").notNull(),
  fallbackEmoji: text("fallback_emoji").notNull(),
  price:         integer("price").notNull(),
  durationHours: text("duration_hours").notNull(),
  title:         jsonb("title").$type<I18nText>().notNull(),
  desc:          jsonb("desc").$type<I18nText>().notNull(),
  includes:      jsonb("includes").$type<I18nList>().notNull(),
  updatedAt:     timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Zod schemas derived from Drizzle table
export const insertExperienceSchema = createInsertSchema(experiencesTable, {
  category: z.array(z.string()),
  title: z.record(z.string(), z.string()),
  desc: z.record(z.string(), z.string()),
  includes: z.record(z.string(), z.array(z.string())),
});

export const selectExperienceSchema = createSelectSchema(experiencesTable, {
  category: z.array(z.string()),
  title: z.record(z.string(), z.string()),
  desc: z.record(z.string(), z.string()),
  includes: z.record(z.string(), z.array(z.string())),
});

export const updateExperienceSchema = insertExperienceSchema
  .partial()
  .omit({ id: true, updatedAt: true });

export type Experience       = typeof experiencesTable.$inferSelect;
export type InsertExperience = typeof experiencesTable.$inferInsert;
export type UpdateExperience = z.infer<typeof updateExperienceSchema>;
