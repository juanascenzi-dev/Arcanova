import { Router, type IRouter } from "express";
import healthRouter from "./health";
import experiencesRouter from "./experiences";
import leadsRouter from "./leads";

const router: IRouter = Router();

router.use(healthRouter);
router.use(experiencesRouter);
router.use(leadsRouter);

export default router;
