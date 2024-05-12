import express, { Request, Response } from "express";
import { decodedAccessToken } from "../../util/TokenVaildate";
import { ChangeTempPeriod } from "../../util/ChangeTempPeriod";
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

router.get("/", async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  const { userId } = decodedAccessToken(accessToken);
  const temp = req.query.temp;
  const fomatTemp = ChangeTempPeriod(Number(temp));

  const Items = connection1.model(userId, ItemSchema);

  const findData = {
    outer: [],
    top: [],
    inner: [],
    bottom: [],
    weight: [],
  };

  // 기온에 맞는 아이템 추출
  findData.outer = await Items.find({ category: "outer", temp: fomatTemp });

  findData.top = await Items.find({ category: "top", temp: fomatTemp });

  findData.inner = await Items.find({ category: "inner", temp: fomatTemp });

  findData.bottom = await Items.find({ category: "bottom", temp: fomatTemp });

  // 모든 아이템 추출
  const AllData: Record<string, any[]> = {
    outer: [],
    top: [],
    inner: [],
    bottom: [],
    weight: [],
  };

  // 전체 아이템 추출
  AllData.outer = await Items.find({ category: "outer" });

  AllData.top = await Items.find({ category: "top" });

  AllData.inner = await Items.find({ category: "inner" });

  AllData.bottom = await Items.find({ category: "bottom" });

  if (
    findData.outer.length === 0 &&
    findData.top.length === 0 &&
    findData.inner.length === 0 &&
    findData.bottom.length === 0
  ) {
    return res.status(200).send({
      data: null,
      message: "아이템 추천왼료",
    });
  }

  // 무작위로 뽑는 함수
  function getRandomValue(arr: ItemType[]) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }

  function getCombination(findData: FindDataType, fixedCategory: string) {
    const newComb: NewCombType = {};
    const newArray: NewCombType[] = [];
    const RecommendData: any = {};

    // 고정아이템 설정
    newComb[fixedCategory] = getRandomValue(findData[fixedCategory]);

    // 고정카테고리를 제외한 나머지로 설정
    let otherCategories: string[] = [];
    if (fixedCategory === "outer") {
      otherCategories = ["top", "inner", "bottom"];
    } else if (fixedCategory === "top") {
      otherCategories = ["inner", "bottom"];
    } else if (fixedCategory === "inner") {
      otherCategories = ["bottom"];
    }

    const uniqueCombinations = new Set();

    // 조합생성
    for (let i = 0; i < 10; i++) {
      otherCategories.forEach((category) => {
        // 찾은 데이터의 weight 가중치가 높은 순으로 추출
        let item = newComb[fixedCategory].weight[category];
        item.sort((a: any, b: any) => b.count - a.count);

        // 찾은 데이터의 weight 가중치가 높은 순으로 추출
        // 가중치 객체에서 가져올 데이터가 없다면 해당 카테고리 아이템 전체에서 랜덤으로 가져옴
        // weight의 아이템보다 추출하는 데이터가 많다면 카테고리 가중치 배열에서 무작위 추출
        if (item.length - 1 >= i) {
          newComb[category] = item[i];
        } else {
          newComb[category] = getRandomValue(AllData[category]);
        }
      });

      const combinationString = JSON.stringify(newComb);

      // count를 제외한 문자열 추출
      function removeCount(combinationKey: string) {
        const obj = JSON.parse(combinationKey);
        for (const key in obj) {
          if (key !== "count" && key !== "weight") {
            delete obj[key]["count"];
            delete obj[key]["weight"];
        }
        }
        return JSON.stringify(obj);
      }

      const combinationKey = removeCount(combinationString);

      // 중복확인해서 중복아닐때만 추가 시킴
      if (!uniqueCombinations.has(combinationKey)) {
        uniqueCombinations.add(combinationKey);

        newArray.push({ ...newComb });
      }

      for (let key in newComb) {
        if (key === fixedCategory) continue;
        newComb[key] = [];
      }
    }

    RecommendData.mainItem = newComb[fixedCategory];
    RecommendData.styles = newArray;
    const mainItem = newComb[fixedCategory];

    return { RecommendData, mainItem };
  }

  const array: RecommendDataType[] = [];

  let check: ItemType[] = [];
  const findOuterLength = findData.outer.length;
  const findTopLength = findData.top.length;
  const findInnerLength = findData.inner.length;

  // 기준이 될 아이템 카테고리 배열
  let fixedCategory = [];
  if (findOuterLength > 0) {
    fixedCategory.push("outer");
  }
  if (findTopLength > 0) {
    fixedCategory.push("top");
  }
  if (findInnerLength > 0) {
    fixedCategory.push("inner");
  }

  while (array.length < findOuterLength + findTopLength + findInnerLength) {
    for (const fixed of fixedCategory) {
      const { RecommendData, mainItem } = getCombination(findData, fixed);

      if (!check.includes(mainItem)) {
        array.push(RecommendData);
        check.push(mainItem);
      }
    }
  }

  return res.status(200).send({
    data: array,
    message: "아이템 추천왼료",
  });
});

export default router;

interface ItemType {
  _id: { $oid: string };
  category: string;
  subcategory: string;
  temp: string;
  imgSrc: string;
  name: string;
  weight: {
    outer: Array<any>;
    top: Array<any>;
    inner: Array<any>;
    bottom: Array<any>;
  };
  __v: { $numberInt: string };
}

interface FindDataType {
  [key: string]: ItemType[];
}

// getCombination 함수에서 사용되는 객체의 타입 정의
interface NewCombType {
  [key: string]: any;
}

interface RecommendDataType {
  mainItem: ItemType;
  styles: NewCombType[];
}
