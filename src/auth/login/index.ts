import express, { Request, Response } from "express";
require("dotenv").config();
import bcrypt from "bcrypt";
const jwt = require("jsonwebtoken");

const router = express.Router();

const mongoose = require("mongoose");
const { MONGO_USER_URI } = process.env;

const connection1 = mongoose.createConnection(MONGO_USER_URI);

// 타입 지정
const UserSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  id: String,
  password: String,
  nickname: String,
});

const User = connection1.model("User", UserSchema);

router.post("/", async (req: Request, res: Response) => {
  const userId = req.body.id;
  const userPW = req.body.password;

  // 입력값이 충분하지 않을 경우
  if (!(userId && userPW)) {
    return res.status(400).send({
      data: null,
      status: "입력값이 충분하지 않습니다.",
    });
  }

  try {
    // 해당 아이디의 사용자 찾기
    const user = await User.findOne({ id: userId });

    if (!user) {
      // 사용자가 존재하지 않을 경우
      return res.status(404).send({
        data: null,
        message: "해당 아이디의 사용자가 존재하지 않습니다.",
      });
    }

    // 비밀번호 검증
    const passwordMatch = await bcrypt.compare(userPW, user.password);

    // 비밀번호가 일치할 경우
    if (passwordMatch) {
      // 토큰 발급
      const accessToken = jwt.sign(
        { username: user.nickname, userId: user._id.toString() },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { username: user.nickname, userId: user._id.toString() },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 1 * 60 * 60 * 1000,
      }); // 1시간 동안 유효

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }); // 7일 동안 유효

      return res.status(200).send({
        data: { username: user.nickname },
        message: "로그인 성공",
      });
    } else {
      // 비밀번호가 일치하지 않을 경우
      return res.status(401).send({
        data: null,
        message: "비밀번호가 일치하지 않습니다.",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({
      data: null,
      message: "서버에서 오류가 발생했습니다.",
    });
  }
});

export default router;
