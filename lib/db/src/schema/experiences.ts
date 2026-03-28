import { pgTable, text, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

// I18n fields use jsonb with Record<string, V> so new languages (it, fr, etc.)
// can be added without schema migrations — just populate the new key in the JSON.
export type I18nText = Record<string, string>;           // { en: "...", es: "..." }
export type I18nList = Record<string, string[]>;         // { en: [...], es: [...] }

export const experiencesTable = pgTable("experiences", {
  id:            text("id").primaryKey(),               // semantic: 'yacht', 'atv', etc.
  slug:          text("slug").notNull().unique(),       // URL-friendly: 'premium-private-yacht'
  sortOrder:     integer("sort_order").notNull().default(0),
  visible:       boolean("visible").notNull().default(true),
  tagType:       text("tag_type").notNull(),            // 'bestSeller', 'adventure', 'extreme', etc.
  category:      jsonb("category").$type<string[]>().notNull(),  // ['adventure', 'relax']
  imageUrl:      text("image_url").notNull(),
  fallbackEmoji: text("fallback_emoji").notNull(),
  price:         integer("price").notNull(),
  durationHours: text("duration_hours").notNull(),      // '6-8' | '3-4' | '1-2', etc.
  title:         jsonb("title").$type<I18nText>().notNull(),
  desc:          jsonb("desc").$type<I18nText>().notNull(),
  includes:      jsonb("includes").$type<I18nList>().notNull(),
  createdAt:     timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:     timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Stricter Zod schemas for validation
const SUPPORTED_LANGUAGES = ['en', 'es', 'it', 'fr'] as const;
const VALID_TAG_TYPES = ['bestSeller', 'adventure', 'extreme', 'cultural', 'comfort', 'planB'] as const;
const VALID_CATEGORIES = ['adventure', 'relax', 'cultural'] as const;

const i18nTextSchema = z.record(
  z.enum(SUPPORTED_LANGUAGES),
  z.string().min(1, 'Text cannot be empty').max(500, 'Text too long')
);

const i18nListSchema = z.record(
  z.enum(SUPPORTED_LANGUAGES),
  z.array(z.string().min(1).max(200)).min(1).max(20)
);

export const insertExperienceSchema = z.object({
  id: z.string().min(1).max(50),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Invalid slug format'),
  sortOrder: z.number().int().min(0).max(999),
  visible: z.boolean(),
  tagType: z.enum(VALID_TAG_TYPES),
  category: z.array(z.enum(VALID_CATEGORIES)).min(1),
  imageUrl: z.string().url('Invalid image URL'),
  fallbackEmoji: z.string().emoji('Must be a valid emoji'),
  price: z.number().int().min(0).max(999999),
  durationHours: z.string().min(1).max(50),
  title: i18nTextSchema,
  desc: i18nTextSchema,
  includes: i18nListSchema,
});

// For updates, all fields optional except we validate structure
export const updateExperienceSchema = insertExperienceSchema
  .partial()
  .omit({ id: true });

export const selectExperienceSchema = insertExperienceSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Experience       = typeof experiencesTable.$inferSelect;
export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type UpdateExperience = z.infer<typeof updateExperienceSchema>;
