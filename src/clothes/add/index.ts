import express, { Request, Response } from "express";
import { decodedAccessToken } from "../../util/TokenVaildate";
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
import multer from "multer";
import fs from "fs";
require("dotenv").config();

const router = express.Router();

// 파일 업로드를 위한 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads"); // 업로드된 파일이 저장될 디렉터리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // 파일의 원본 파일명 사용
  },
});

const upload = multer({ storage: storage });

// 환경변수
const { MONGO_ITEM_URI } = process.env;
const { S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION, S3_BUCKET_NAME,CLOUDFRONT_URL } = process.env;

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

router.post(
  "/",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const accessToken = req.cookies.accessToken;
    const { userId } = decodedAccessToken(accessToken);

    const image = req.file; // 이미지 파일
    const name = req.body.name; // 이름 필드

    if (
      image &&
      S3_ACCESS_KEY &&
      S3_SECRET_KEY &&
      S3_REGION &&
      S3_BUCKET_NAME
    ) {
      const client = new S3Client({
        region: S3_REGION,
        credentials: {
          accessKeyId: S3_ACCESS_KEY,
          secretAccessKey: S3_SECRET_KEY,
        },
      });

      const key = `${userId}/${name}`;
      const fileStream = fs.createReadStream(image.path);

      const params = {
        Key: key,
        Body: fileStream,
        Bucket: S3_BUCKET_NAME,
        ACL: ObjectCannedACL.public_read,
      };

      try {
        const command = new PutObjectCommand(params);
        await client.send(command);
        const imgUrl = `${CLOUDFRONT_URL}/${key}`; 

        const Items = connection1.model(userId, ItemSchema);
        const { file, ...rest } = req.body;

        const newItem = new Items({
          ...rest,
          imgSrc: imgUrl,
          weight: { outer: [], top: [], inner: [], bottom: [] },
        });

        newItem
          .save()
          .then(() => {
            fs.unlink(image.path, (err) => {
              if (err) {
                console.error("로컬이미지삭제 에러:", err);
              } else {
                console.log("로컬이미지 삭제완료");
              }
            });

            return res.status(200).send({
              message: "아이템 추가 성공",
            });
          })
          .catch((err: string) => {
            console.log("Error : " + err);
            return res.status(200).send({
              message: "아이템 추가 실패",
            });
          });
      } catch (error) {
        console.error("There was a problem with uploading to S3:", error);
        return res.status(500).send({
          message: "파일 업로드에 실패했습니다.",
        });
      }
    }
  }
);

export default router;
