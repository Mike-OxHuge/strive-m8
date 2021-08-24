import express from "express";
const router = express.Router();
router.use(express.json());

import wakeUpRouter from "./wakeup/index.js";
import UserRouter from "./users/index.js";

router.use("/v1/wakeup", wakeUpRouter);
router.use("/v1/user", UserRouter);

export default router;
