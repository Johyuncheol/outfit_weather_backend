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
  function getRandomValue(arr: any[]) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }

  function getCombination(findData: any, fixedCategory: string): any {
    const newComb: any = {};
    const newArray: any = [];
    const RecommendData: any = {};
    let isRandom = false;

    const prev: any = {};
    // 고정아이템 설정

    newComb[fixedCategory] = getRandomValue(findData[fixedCategory]);
    prev[fixedCategory] = newComb[fixedCategory];

    // 고정카테고리를 제외한 나머지로 설정
    let otherCategories: any[] = [];
    if (fixedCategory === "outer") {
      otherCategories = ["top", "inner", "bottom"];
    } else if (fixedCategory === "top") {
      otherCategories = ["inner", "bottom"];
    } else if (fixedCategory === "inner") {
      otherCategories = ["bottom"];
    }

    const uniqueCombinations = new Set();

    for (let i = 0; i < 10; i++) {
      otherCategories.forEach((category) => {
        let item = newComb[fixedCategory].weight[category];
        item.sort((a: any, b: any) => b.count - a.count);

        if (item.length - 1 >= i) {
          newComb[category] = item[i];
          isRandom = false;
        } else if (item.length === 0) {
          newComb[category] = getRandomValue(AllData[category]);
          isRandom = true;
        } else {
          newComb[category] = getRandomValue(item);
          isRandom = false;
        }
      });

      // 중복확인해서 중복아닐때만 추가 시킴
      const combinationKey1 = JSON.stringify(newComb);
      const combinationKey2 = JSON.stringify(prev);
      if (
        !uniqueCombinations.has(combinationKey1) &&
        combinationKey1 !== combinationKey2
      ) {
        uniqueCombinations.add(combinationKey1);
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

    return { RecommendData, mainItem, isRandom };
  }

  const array: any[] = [];

  let check: any = [];

  // 가장 상위 카테고리 옷 찾기
  let fixedCategory = [];
  if (findData.outer.length > 0) {
    fixedCategory.push("outer");
  }
  if (findData.top.length > 0) {
    fixedCategory.push("top");
  }
  if (findData.inner.length > 0) {
    fixedCategory.push("inner");
  }

  for (let i = 0; i < 4; i++) {
    for (const fixed of fixedCategory) {
      const { RecommendData, mainItem, isRandom } = getCombination(
        findData,
        fixed
      );
      if (!check.includes(mainItem)) {
        if (isRandom) {
          array.push(RecommendData);
        } else {
          array.unshift(RecommendData);
        }
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
