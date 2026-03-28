import { Router } from "express";
import { signAdminToken, verifyAdminPin } from "../middlewares/auth";

const router = Router();

router.post("/admin/login", (req, res) => {
  const { pin } = req.body as { pin?: string };

  if (!pin || typeof pin !== "string") {
    res.status(400).json({ error: "PIN is required" });
    return;
  }

  if (!verifyAdminPin(pin)) {
    res.status(401).json({ error: "Contraseña incorrecta" });
    return;
  }

  const token = signAdminToken();
  res.json({ token, expiresIn: "8h" });
});

export default router;
