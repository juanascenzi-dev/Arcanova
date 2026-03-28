import { Router, type IRouter } from "express";
import healthRouter from "./health";
import experiencesRouter from "./experiences";
import leadsRouter from "./leads";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(experiencesRouter);
router.use(leadsRouter);

export default router;
