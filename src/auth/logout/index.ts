import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", async (req:Request, res: Response) => {
  // 쿠키에서 accessToken과 refreshToken 삭제
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).send({
    message: "로그아웃되었습니다.",
  });
});

export default router;
