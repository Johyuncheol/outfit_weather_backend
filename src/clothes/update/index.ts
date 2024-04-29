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

router.patch("/", async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  const { userId } = decodedAccessToken(accessToken);
  const { _id: itemId, ...updateData } = req.body;

  const Items = connection1.model(userId, ItemSchema);

  // 아이템 업데이트
  await Items.updateOne({ _id: new ObjectId(itemId) }, { $set: updateData });

  //전체아이템 가져오기
  const allItems = await Items.find({});

  // 모든 아이템들의 가중치에서 변경
  allItems.forEach(async (doc: any) => {
    for (var key in doc.weight) {
      if (Array.isArray(doc.weight[key]) && doc.weight[key].length > 0) {
        doc.weight[key] = doc.weight[key].map((item: any) => {
          if (item._id.toString() === itemId) {
            console.log(111);
            console.log({ ...item, ...updateData });
            return { ...item, ...updateData };
          }
          return item;
        });
      }
    }
    await Items.updateOne({ _id: doc._id }, { $set: { weight: doc.weight } });
  });

  return res.status(200).send({
    message: "아이템 수정왼료",
  });
});

export default router;
