import express, { Request, Response } from "express";
require("dotenv").config();
import bcrypt from "bcrypt";

const router = express.Router();

const mongoose = require("mongoose");
const { MONGO_USER_URI } = process.env;

const connection1 = mongoose.createConnection(MONGO_USER_URI);

// 타입 지정
const UserSchema = new mongoose.Schema({
  id: String,
  password: String,
  nickname: String,
});

const User = connection1.model("user", UserSchema);

router.post("/", async (req: Request, res: Response) => {
  const userId = req.body.id;
  const userPW = req.body.password;
  const userNickName = req.body.nickname;

  // 입력값이 충분 하지않을 경우
  if (!(userId && userPW && userNickName)) {
    return res.status(401).send({
      data: null,
      message: "입력값을 확인해주세요",
    });
  }

  // 존재여부 확인
  const existingUser = await User.find({ id: userId });

  // 이미 존재하는 유저(id)일 때
  if (existingUser.length > 0) {
    return res.status(201).send({
      data: null,
      message: "이미 존재하는 유저입니다",
    });
  }

  const hashedPassword = await bcrypt.hash(userPW, 10);

  // 회원 정보에 저장될 객체 생성
  const me = new User({
    id: userId,
    password: hashedPassword,
    nickname: userNickName,
  });

  // 저장
  me.save()
    .then(() => {
      console.log("저장완료");
    })
    .catch((err: string) => {
      console.log("Error : " + err);
    });

  return res.status(200).send({
    data: null,
    message: "회원가입 성공",
  });
});

export default router;
