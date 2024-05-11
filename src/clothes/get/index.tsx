import express, { Request, Response } from "express";
import { decodedAccessToken } from "../../util/TokenVaildate";
import { ChangeTempPeriod } from "../../util/ChangeTempPeriod";
require("dotenv").config();

const router = express.Router();

// 환경변수
const { MONGO_ITEM_URI } = process.env;

// mongoDB 설정
const mongoose = require("mongoose");
const connection1 = mongoose.createConnection(MONGO_ITEM_URI);

// 타입 지정
const ItemSchema = new mongoose.Schema({
  category: String,
  subcategory: String,
  temp: String,
  imgSrc: String,
  name: String,
  weight: Object,
});

router.get("/", async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  const { userId } = decodedAccessToken(accessToken);

  const Items = connection1.model(userId, ItemSchema);

  let findData = {
    outer: [],
    top: [],
    inner: [],
    bottom: [],
  };

  findData.outer = await Items.find({ category: "outer" });

  findData.top = await Items.find({ category: "top" });

  findData.inner = await Items.find({ category: "inner" });

  findData.bottom = await Items.find({ category: "bottom" });

  return res.status(200).send({
    data: findData,
    message: "아이템 조회왼료",
  });
});

router.get("/nav", async (req: Request, res: Response) => {

  const accessToken = req.cookies.accessToken;
  const { userId } = decodedAccessToken(accessToken);
  const temp = req.query.temp;
  const fomatTemp = ChangeTempPeriod(Number(temp));

  const Items = connection1.model(userId, ItemSchema);

  const findData = await Items.find({ temp: fomatTemp });

  return res.status(200).send({
    data: findData,
    message: "아이템 조회왼료",
  });
});

export default router;
