import express from "express";
import recommendRouter from "./recommend";
import addRouter from "./add";
import getRouter from "./get";
import selectRouter from "./select";
import deleteRouter from "./delete";
import updateRouter from "./update";
const router = express.Router();

// /api/user/clothes/*
router.use("/recommend", recommendRouter);
router.use("/add", addRouter);
router.use("/get", getRouter);
router.use("/select", selectRouter);
router.use("/delete", deleteRouter);
router.use("/update", updateRouter);

export default router;
