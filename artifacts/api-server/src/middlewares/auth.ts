import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

// JWT_SECRET: required in production. Never fall back to a predictable default.
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;
if (!JWT_SECRET) {
  if (isProduction) {
    console.error("FATAL: JWT_SECRET environment variable is not set. Refusing to start.");
    process.exit(1);
  } else {
    console.warn("⚠️  JWT_SECRET not set — using insecure dev default. Set it before deploying.");
  }
}
const JWT_SECRET_RESOLVED = JWT_SECRET || "austral-dev-secret-not-for-production";

// ADMIN_PIN: required in production. Never fall back to a known default.
const ADMIN_PIN = process.env.ADMIN_PIN;
if (!ADMIN_PIN) {
  if (isProduction) {
    console.error("FATAL: ADMIN_PIN environment variable is not set. Refusing to start.");
    process.exit(1);
  } else {
    console.warn("⚠️  ADMIN_PIN not set — using insecure dev default 'austral2025'. Set it before deploying.");
  }
}
const ADMIN_PIN_RESOLVED = ADMIN_PIN || "austral2025";

const TOKEN_TTL = "8h";

export interface AdminJwtPayload {
  role: "admin";
  iat: number;
  exp: number;
}

export function signAdminToken(): string {
  return jwt.sign({ role: "admin" }, JWT_SECRET_RESOLVED, { expiresIn: TOKEN_TTL });
}

export function verifyAdminPin(pin: string): boolean {
  return pin === ADMIN_PIN_RESOLVED;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET_RESOLVED) as AdminJwtPayload;
    if (payload.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
