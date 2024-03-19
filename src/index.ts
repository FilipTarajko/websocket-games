import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import authRouter from "./auth";
import "dotenv/config";

const app = express();
const port = process.env.PORT ?? 3000;

if (process.env.NODE_ENV === "development") {
  app.use(logger(":method :url"));
}

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/", authRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port} in ${process.env.NODE_ENV} mode.`);
});
