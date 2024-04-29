import express, { Request, Response } from "express";
const jwt = require("jsonwebtoken");
const router = express.Router();
const mongoose = require("mongoose");
const { MONGO_USER_URI } = process.env;
const { ObjectId } = require("mongoose").Types;

const connection1 = mongoose.createConnection(MONGO_USER_URI);

// 타입 지정
const UserSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  id: String,
  password: String,
  nickname: String,
});

const User = connection1.model("User", UserSchema);

router.get("/", async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  // 엑세스 토큰의 사용자 정보 가져오기
  const decodedAccessToken: any = jwt.decode(accessToken);
  const accessTokenUserId = decodedAccessToken.userId;
  const user = await User.findOne({ _id: new ObjectId(accessTokenUserId) });

  return res.status(200).send({
    data: user.nickname,
    message: "로그인된 사용자 입니다.",
  });
});

export default router;
