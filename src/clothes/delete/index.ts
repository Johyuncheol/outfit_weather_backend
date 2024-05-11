import express, { Request, Response } from "express";
import { decodedAccessToken } from "../../util/TokenVaildate";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
require("dotenv").config();

const router = express.Router();
const { ObjectId } = require("mongoose").Types;

// 환경변수
const { MONGO_ITEM_URI } = process.env;
const { S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION, S3_BUCKET_NAME } = process.env;

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
  const name = req.body.name;
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

  if (S3_ACCESS_KEY && S3_SECRET_KEY && S3_REGION && S3_BUCKET_NAME) {
    const client = new S3Client({
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      },
    });

    // S3에서 이미지 삭제
    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: `${userId}/${name}`,
    };

    try {
      await client.send(new DeleteObjectCommand(params));
      console.log("이미지가 성공적으로 삭제되었습니다.");
      return res.status(200).send({
        message: "아이템 삭제왼료",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        message: "아이템 삭제에러",
      });
    }
  }
});

export default router;
