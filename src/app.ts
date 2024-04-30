import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import TokenRouter from "./TokenRouter";
import authRouter from "./auth";

require("dotenv").config();

const app: Application = express();
const cors = require("cors");
const port = 8080;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://outfit-weather-iota.vercel.app"
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.listen(port, function () {
  console.log(`App is listening on port ${port} !`);
});

///////////////////////////////////
// 라우터

app.use("/api/user", TokenRouter);
app.use("/api/auth", authRouter);
/* app.use("/api", Router); */

/////////////////////////////////////
