import { pgTable, text, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

// I18n fields use jsonb with Record<string, V> so new languages (it, fr, etc.)
// can be added without schema migrations — just populate the new key in the JSON.
export type I18nText = Record<string, string>;           // { en: "...", es: "..." }
export type I18nList = Record<string, string[]>;         // { en: [...], es: [...] }

// ─── Booking rules & pricing types ───────────────────────────────────────────

export type ChargeMode =
  | 'per_person'           // rate × (adults × pa + children × pc + seniors × ps)
  | 'per_group_fixed'      // fixed group price per booking
  | 'per_day'              // priceDay × days
  | 'per_person_per_day'   // per-person cost × days
  | 'per_group_per_day';   // priceGroup × days

export type ServiceBookingRules = {
  chargeMode: ChargeMode;
  minTravelers?: number;          // minimum required travelers
  maxTravelers?: number;          // maximum allowed travelers (enforced in UI)
  includedTravelers?: number;     // base group size for fixed-group pricing
  chargeFullIncludedGroup?: boolean; // if true, always charge for includedTravelers even if fewer are selected
};

export type ServicePricing = {
  priceAdult?: number;   // USD per adult
  priceChild?: number;   // USD per child
  priceSenior?: number;  // USD per senior
  priceGroup?: number;   // USD flat for the whole group
  priceDay?: number;     // USD per day (for per_day / per_group_per_day modes)
};

// ─── Table definition ─────────────────────────────────────────────────────────

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
  // ── NEW: booking rules & service pricing ──────────────────────────────────
  bookingRules:  jsonb("booking_rules").$type<ServiceBookingRules>(),
  servicePricing: jsonb("service_pricing").$type<ServicePricing>(),
  // ─────────────────────────────────────────────────────────────────────────
  createdAt:     timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:     timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Validation ───────────────────────────────────────────────────────────────

const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
const VALID_TAG_TYPES = ['bestSeller', 'adventure', 'extreme', 'cultural', 'comfort', 'planB'] as const;
const VALID_CATEGORIES = ['adventure', 'relax', 'cultural'] as const;
const VALID_CHARGE_MODES = [
  'per_person',
  'per_group_fixed',
  'per_day',
  'per_person_per_day',
  'per_group_per_day',
] as const;

const i18nTextSchema = z.record(
  z.string(),
  z.string().min(1, 'Text cannot be empty').max(500, 'Text too long')
);

const i18nListSchema = z.record(
  z.string(),
  z.array(z.string().min(1).max(200)).min(1).max(20)
);

const serviceBookingRulesSchema = z.object({
  chargeMode: z.enum(VALID_CHARGE_MODES),
  minTravelers: z.number().int().min(1).max(100).optional(),
  maxTravelers: z.number().int().min(1).max(100).optional(),
  includedTravelers: z.number().int().min(1).max(100).optional(),
  chargeFullIncludedGroup: z.boolean().optional(),
}).optional().nullable();

const servicePricingSchema = z.object({
  priceAdult: z.number().min(0).max(99999).optional(),
  priceChild: z.number().min(0).max(99999).optional(),
  priceSenior: z.number().min(0).max(99999).optional(),
  priceGroup: z.number().min(0).max(99999).optional(),
  priceDay: z.number().min(0).max(99999).optional(),
}).optional().nullable();

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
  bookingRules: serviceBookingRulesSchema,
  servicePricing: servicePricingSchema,
});

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
