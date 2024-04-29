import express, { Request, Response } from "express";
import { decodedAccessToken } from "../../util/TokenVaildate";
import { ChangeTempPeriod } from "../../util/ChangeTempPeriod";
require("dotenv").config();

const { ObjectId } = require("mongoose").Types;

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

router.post("/", async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  const { userId } = decodedAccessToken(accessToken);
  const { outer, top, inner, bottom } = req.body;
  console.log(outer);
  const Items = connection1.model(userId, ItemSchema);

  interface itemtype {
    category: String;
    subcategory: String;
    temp: String;
    imgSrc: String;
    name: String;
    weight: Object;
  }

  interface aa {
    outer: itemtype[];
    top: itemtype[];
    inner: itemtype[];
    bottom: itemtype[];
  }

  const outerItem = await Items.findOne({ _id: new ObjectId(outer) });
  const topItem = await Items.findOne({ _id: new ObjectId(top) });
  const innerItem = await Items.findOne({ _id: new ObjectId(inner) });
  const bottomItem = await Items.findOne({ _id: new ObjectId(bottom) });

  /// 아우터
  if (outer && outerItem.weight.top) {
    console.log(1)
    const indexTop = outerItem.weight.top.findIndex(
      (item: { _id: any }) =>
        item._id.toString() === new ObjectId(top).toString()
    );

    if (indexTop !== -1) {
      outerItem.weight.top[indexTop].count++;
    } else {
      outerItem.weight.top.push({ ...topItem.toObject(), count: 1 });
      console.log(outerItem);
    }

    ///////////
    const indexInner = outerItem.weight.inner.findIndex(
      (item: { _id: any }) =>
        item._id.toString() === new ObjectId(inner).toString()
    );

    if (indexInner !== -1) {
      outerItem.weight.inner[indexInner].count++;
    } else {
      outerItem.weight.inner.push({ ...innerItem.toObject(), count: 1 });
    }

    ///////////
    const indexbottom = outerItem.weight.bottom.findIndex(
      (item: { _id: any }) =>
        item._id.toString() === new ObjectId(bottom).toString()
    );

    if (indexbottom !== -1) {
      outerItem.weight.bottom[indexbottom].count++;
    } else {
      outerItem.weight.bottom.push({ ...bottomItem.toObject(), count: 1 });
    }

    try {
      await Items.updateOne(
        { _id: new ObjectId(outer) },
        { $set: { weight: outerItem.weight } },
        { upsert: false }
      );
    } catch (err) {
      console.log("Error : " + err);
      return res.status(200).send({
        message: "가중치 변경 실패",
      });
    }
  }
  /// 상의 ////////////////////////////////////////////
  if (topItem && topItem.weight.inner) {
    console.log(2)
    const indexInner = topItem.weight.inner.findIndex(
      (item: { _id: any }) =>
        item._id.toString() === new ObjectId(inner).toString()
    );

    if (indexInner !== -1) {
      topItem.weight.inner[indexInner].count++;
    } else {
      topItem.weight.inner.push({ ...innerItem.toObject(), count: 1 });
    }

    ///////////
    const indexbottom = topItem.weight.bottom.findIndex(
      (item: { _id: any }) =>
        item._id.toString() === new ObjectId(bottom).toString()
    );

    if (indexbottom !== -1) {
      topItem.weight.bottom[indexbottom].count++;
    } else {
      topItem.weight.bottom.push({ ...bottomItem.toObject(), count: 1 });
    }

    try {
      await Items.updateOne(
        { _id: new ObjectId(top) },
        { $set: { weight: topItem.weight } },
        { upsert: false }
      );
    } catch (err) {
      console.log("Error : " + err);
      return res.status(200).send({
        message: "가중치 변경 실패",
      });
    }
  }
  /// 이너 ////////////////////////////////////////////
  if (innerItem && innerItem.weight.bottom) {
    console.log(3)
    ///////////
    const indexbottom = innerItem.weight.bottom.findIndex(
      (item: { _id: any }) =>
        item._id.toString() === new ObjectId(bottom).toString()
    );

    if (indexbottom !== -1) {
      innerItem.weight.bottom[indexbottom].count++;
    } else {
      innerItem.weight.bottom.push({ ...bottomItem.toObject(), count: 1 });
    }

    try {
      await Items.updateOne(
        { _id: new ObjectId(inner) },
        { $set: { weight: innerItem.weight } },
        { upsert: false }
      );
    } catch (err) {
      console.log("Error : " + err);
      return res.status(200).send({
        message: "가중치 변경 실패",
      });
    }
  }
  return res.status(200).send({
    message: "코디 선택왼료",
  });
});

router.get("/nav", async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  const { userId } = decodedAccessToken(accessToken);
  const temp = req.query.temp;
  const fomatTemp = ChangeTempPeriod(Number(temp));

  const Items = connection1.model(userId, ItemSchema);

  const findData = await Items.find({ temp: fomatTemp });

  console.log(findData);
  return res.status(200).send({
    data: findData,
    message: "아이템 조회왼료",
  });
});

export default router;
