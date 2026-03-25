import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import moodsRouter from "./moods";
import lunarRouter from "./lunar";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(moodsRouter);
router.use(lunarRouter);
router.use(usersRouter);

export default router;
