import express from "express";
import {
  verifyRefreshToken,
  verifyAccessToken,
  generateAccessToken,
  decodedAccessToken,
} from "./util/TokenVaildate";
import clothesRouter from "./clothes/index";
import IsLoginRouter from "./auth/isLogin";

const router = express.Router();

// 미들웨어 함수를 사용하여 토큰 검증 및 재발급을 처리
router.use(async (req, res, next) => {
  // 여기에 토큰 검증 및 재발급 로직을 구현
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    return res.status(401).json({ message: "No accessToken" });
  }

  if (!refreshToken) {
    return res.status(401).json({ message: "No Refreshtoken" });
  }

  try {
    // 엑세스 토큰 검증
    const isUserValid = verifyAccessToken(accessToken, refreshToken);

    if (!isUserValid) throw new Error("Is wrong Token (access,refresh)");

    const isTimeValid = decodedAccessToken(accessToken);
    console.log(accessToken);
    // 엑세스 토큰이 만료된 경우 재발급
    if (!isTimeValid) {
      const decodedRefreshToken = verifyRefreshToken(refreshToken);
      const { userId, username } = decodedRefreshToken;
      const newAccessToken = generateAccessToken({ userId, username });

      // 새로 발급한 엑세스 토큰으로 요청에 대한 응답 설정
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1 * 60 * 60 * 1000,
      });

      req.cookies.accessToken = newAccessToken;
    }

    // 토큰이 유효하면 다음 미들웨어로 이동
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
});

// /api/user/*
router.use("/clothes", clothesRouter);
router.use("/islogin", IsLoginRouter);
export default router;
