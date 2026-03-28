import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./routes";

const app: Express = express();

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ─── CORS ────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

const isProduction = process.env.NODE_ENV === "production";

// In development (no ALLOWED_ORIGINS set), allow everything.
// In production, require ALLOWED_ORIGINS to be set explicitly.
if (isProduction && ALLOWED_ORIGINS.length === 0) {
  console.warn("⚠️  WARNING: ALLOWED_ORIGINS is not set in production. CORS will block all browser requests.");
}

const corsOptions: cors.CorsOptions = {
  origin: ALLOWED_ORIGINS.length > 0
    ? (origin, callback) => {
        // Allow server-to-server requests (no origin header)
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin '${origin}' not allowed`));
        }
      }
    : true,
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
};

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// ─── Rate limiting ────────────────────────────────────────────────────────────
// General limiter: 200 requests / 15 min per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Strict limiter for auth: 10 attempts / 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again in 15 minutes." },
});

// Lead creation limiter: 30 leads / 15 min per IP (anti-spam)
const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.use("/api", generalLimiter);
app.use("/api/admin/login", authLimiter);
app.use("/api/leads", leadLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", router);

export default app;
