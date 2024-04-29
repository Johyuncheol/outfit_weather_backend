import express, { Request, Response } from "express";
import { decodedAccessToken } from "../../util/TokenVaildate";
require("dotenv").config();

const router = express.Router();
const { ObjectId } = require("mongoose").Types;

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

router.post("/", async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  const { userId } = decodedAccessToken(accessToken);
  const ItemId = req.body._id;
  const Items = connection1.model(userId, ItemSchema);

  // 아이템 삭제
  await Items.deleteMany({ _id: new ObjectId(ItemId) });
  // 모든 아이템들의 가중치에서 삭제
  const allItems = await Items.find({});

  allItems.forEach(async (doc: any) => {
    for (var key in doc.weight) {
      if (Array.isArray(doc.weight[key]) && doc.weight[key].length > 0) {
        doc.weight[key] = doc.weight[key].filter((item: any) => {
          return item._id.toString() !== ItemId;
        });
      }
    }
    await Items.updateOne({ _id: doc._id }, { $set: { weight: doc.weight } });
  });

  return res.status(200).send({
    message: "아이템 삭제왼료",
  });
});

export default router;
