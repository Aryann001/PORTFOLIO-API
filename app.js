import cookieParser from "cookie-parser";
import express from "express";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
import errorMiddleware from "./middlewares/error.js";
import cors from "cors";

dotenv.config({
  path: "./config/config.env",
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());
app.use(
  cors({
    origin: process.env.FRONTEND_URI,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

import UserRoute from "./routes/userRoute.js";

app.use("/api/v1", UserRoute);

app.use(errorMiddleware);

export default app;
