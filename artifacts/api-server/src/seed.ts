/**
 * Seed the database with the initial 6 experiences.
 * Safe to re-run — uses ON CONFLICT DO UPDATE to refresh booking rules & pricing.
 * Run with: DATABASE_URL="..." pnpm tsx artifacts/api-server/src/seed.ts
 */
import { db } from "@workspace/db";
import { experiencesTable } from "@workspace/db/schema";
import { sql } from "drizzle-orm";

const experiences = [
  {
    id: "yacht",
    slug: "premium-private-yacht",
    sortOrder: 1,
    visible: true,
    tagType: "bestSeller",
    category: ["adventure", "relax"],
    imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80",
    fallbackEmoji: "⛵",
    price: 1200,
    durationHours: "6-8",
    title: { en: "Premium Private Yacht", es: "Yate Privado Premium" },
    desc: {
      en: "Sail the turquoise waters of the Caribbean in a luxury yacht with a chef on board and open bar.",
      es: "Navega las aguas turquesas del Caribe en un yate de lujo con chef a bordo y barra libre.",
    },
    includes: {
      en: ["Premium open bar", "On-board chef", "Snorkel gear", "Towels and amenities"],
      es: ["Barra libre premium", "Chef a bordo", "Equipo de snorkel", "Toallas y amenidades"],
    },
    // Up to 12 guests — charged per person
    bookingRules: {
      chargeMode: "per_person",
      minTravelers: 2,
      maxTravelers: 12,
    },
    servicePricing: {
      priceAdult: 120,
      priceChild: 80,
      priceSenior: 100,
    },
  },
  {
    id: "atv",
    slug: "atv-jungle-adventure",
    sortOrder: 2,
    visible: true,
    tagType: "adventure",
    category: ["adventure"],
    imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80",
    fallbackEmoji: "🏍️",
    price: 180,
    durationHours: "3-4",
    title: { en: "ATV Jungle Adventure", es: "Cuatriciclos en la Selva" },
    desc: {
      en: "Pure adrenaline riding through hidden trails in the Mayan jungle until reaching a private cenote.",
      es: "Adrenalina pura recorriendo senderos ocultos en la selva maya hasta llegar a un cenote privado.",
    },
    includes: {
      en: ["Latest generation ATVs", "Expert guide", "Cenote swim", "Snacks and drinks"],
      es: ["ATV de ultima generacion", "Guia experto", "Nado en cenote", "Snacks y bebidas"],
    },
    // Up to 4 — fixed group price. If fewer than 4 selected, still charge for 4.
    bookingRules: {
      chargeMode: "per_group_fixed",
      minTravelers: 1,
      maxTravelers: 4,
      includedTravelers: 4,
      chargeFullIncludedGroup: true,
    },
    servicePricing: {
      priceGroup: 180,
    },
  },
  {
    id: "bungee",
    slug: "extreme-bungee-jumping",
    sortOrder: 3,
    visible: true,
    tagType: "extreme",
    category: ["adventure"],
    imageUrl: "https://images.unsplash.com/photo-1521150932951-303a95503ed3?w=800&q=80",
    fallbackEmoji: "🪂",
    price: 150,
    durationHours: "1-2",
    title: { en: "Extreme Bungee Jumping", es: "Bungee Jumping Extremo" },
    desc: {
      en: "Challenge your limits with a leap over the Caribbean sea. Only for the brave.",
      es: "Desafia tus limites con un salto al vacio sobre el mar Caribe. Solo para valientes.",
    },
    includes: {
      en: ["Certified safety gear", "HD Video of the jump", "Certificate of courage"],
      es: ["Equipo de seguridad certificado", "Video HD del salto", "Certificado de valor"],
    },
    // 1-2 people, per person
    bookingRules: {
      chargeMode: "per_person",
      minTravelers: 1,
      maxTravelers: 2,
    },
    servicePricing: {
      priceAdult: 150,
      priceChild: 0,
      priceSenior: 0,
    },
  },
  {
    id: "chichenitza",
    slug: "vip-chichen-itza",
    sortOrder: 4,
    visible: true,
    tagType: "cultural",
    category: ["cultural"],
    imageUrl: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80",
    fallbackEmoji: "🏛️",
    price: 350,
    durationHours: "8-10",
    title: { en: "VIP Chichen Itza", es: "Chichen Itza VIP" },
    desc: {
      en: "Discover the wonder of the world with a private expert guide, avoiding the crowds.",
      es: "Descubre la maravilla del mundo con un guia privado experto, evitando las multitudes.",
    },
    includes: {
      en: ["Private transport", "Archaeological guide", "Gourmet lunch", "VIP skip-the-line tickets"],
      es: ["Transporte privado", "Guia arqueologico", "Almuerzo gourmet", "Entradas VIP sin fila"],
    },
    // Up to 20 people — per person pricing
    bookingRules: {
      chargeMode: "per_person",
      minTravelers: 1,
      maxTravelers: 20,
    },
    servicePricing: {
      priceAdult: 350,
      priceChild: 200,
      priceSenior: 300,
    },
  },
  {
    id: "transfers",
    slug: "vip-airport-transfers",
    sortOrder: 5,
    visible: true,
    tagType: "comfort",
    category: ["relax"],
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    fallbackEmoji: "🚙",
    price: 80,
    durationHours: "1-2",
    title: { en: "VIP Airport Transfers", es: "Traslados VIP Aeropuerto" },
    desc: {
      en: "Start your trip on the right foot. Luxury SUV transfers with cold drinks ready for you.",
      es: "Comienza tu viaje con el pie derecho. Traslados en SUV de lujo con bebidas frias.",
    },
    includes: {
      en: ["Bilingual driver", "Luxury/Armored SUV", "Complimentary drinks", "Flight monitoring"],
      es: ["Chofer bilingue", "SUV blindada/lujo", "Bebidas de cortesia", "Monitoreo de vuelo"],
    },
    // Up to 6 — fixed group price
    bookingRules: {
      chargeMode: "per_group_fixed",
      minTravelers: 1,
      maxTravelers: 6,
    },
    servicePricing: {
      priceGroup: 80,
    },
  },
  {
    id: "rainday",
    slug: "premium-rainy-day-plan",
    sortOrder: 6,
    visible: true,
    tagType: "planB",
    category: ["relax"],
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
    fallbackEmoji: "🧖",
    price: 220,
    durationHours: "4-6",
    title: { en: "Premium Rainy Day Plan", es: "Dia de Lluvia Premium" },
    desc: {
      en: "If the weather doesn't cooperate, we have the perfect plan: interactive museums, VIP shopping, and spa.",
      es: "Si el clima no acompana, tenemos el plan perfecto: museos interactivos, shopping VIP y spa.",
    },
    includes: {
      en: ["Private transport", "Indoor attraction tickets", "Exclusive restaurant reservations"],
      es: ["Transporte privado", "Entradas a atracciones techadas", "Reserva en restaurantes exclusivos"],
    },
    // Per person
    bookingRules: {
      chargeMode: "per_person",
      minTravelers: 1,
      maxTravelers: 10,
    },
    servicePricing: {
      priceAdult: 220,
      priceChild: 150,
      priceSenior: 200,
    },
  },
];

async function seed() {
  console.log("Seeding experiences...");
  for (const exp of experiences) {
    await db
      .insert(experiencesTable)
      .values(exp as any)
      .onConflictDoUpdate({
        target: experiencesTable.id,
        set: {
          bookingRules: exp.bookingRules as any,
          servicePricing: exp.servicePricing as any,
          updatedAt: new Date(),
        },
      });
    console.log(`  ok: ${exp.id}`);
  }
  console.log("Done!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
