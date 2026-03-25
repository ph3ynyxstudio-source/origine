import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import moodsRouter from "./moods";
import lunarRouter from "./lunar";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(moodsRouter);
router.use(lunarRouter);

export default router;
