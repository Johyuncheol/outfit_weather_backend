import express from "express";
import loginRouter from "./login";
import registerRouter from "./register";
import logoutRouter from "./logout";
const router = express.Router();

// /api/auth/*
router.use("/register", registerRouter);
router.use("/login", loginRouter);
router.use("/logout", logoutRouter);
export default router;
