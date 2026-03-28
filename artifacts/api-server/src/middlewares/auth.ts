import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "austral-dev-secret-change-in-prod";
const ADMIN_PIN = process.env.ADMIN_PIN || "austral2025";
const TOKEN_TTL = "8h";

export interface AdminJwtPayload {
  role: "admin";
  iat: number;
  exp: number;
}

export function signAdminToken(): string {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyAdminPin(pin: string): boolean {
  return pin === ADMIN_PIN;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
    if (payload.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
