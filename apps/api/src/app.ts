import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { existsSync } from "fs";
import path from "path";
import authRouter from "./routes/auth.routes.js";
import logger from "./middlewares/logger.js";
import listingRouter from "./routes/listing.routes.js";
import { initSocket } from "./chat/chat.js";
import chatRouter from "./routes/chat.routes.js";
import offerRouter from "./routes/offer.routes.js";
import saveRouter from "./routes/save.routes.js";
import errorHandler from "./middlewares/error.handler.js";
import userRouter from "./routes/user.routes.js";

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

// Middlewares
app.disable("x-powered-by");
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(logger);

// Routes
app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json({ status: "ok" });
});
app.use("/api/auth", authRouter);
app.use("/api/listings", listingRouter);
app.use("/api/chats", chatRouter);
app.use("/api/users", userRouter);
app.use("/api/offers", offerRouter);
app.use("/api/saves", saveRouter);

const webDistPath = path.resolve(process.cwd(), "../web/dist");
const webIndexPath = path.join(webDistPath, "index.html");

if (existsSync(webIndexPath)) {
  app.use(express.static(webDistPath));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) {
      return next();
    }
    return res.sendFile(webIndexPath);
  });
}

app.use(errorHandler);

export default httpServer;
