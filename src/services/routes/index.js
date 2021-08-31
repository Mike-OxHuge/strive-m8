import express from "express";
const router = express.Router();
router.use(express.json());

import wakeUpRouter from "./wakeup/index.js";
import UserRouter from "./users-v2/index.js";
import JestRouter from "./products-jest/index.js";

router.use("/v1/wakeup", wakeUpRouter);
router.use("/v1/user", UserRouter);
router.use("/v1/jest-test", JestRouter);

export default router;
