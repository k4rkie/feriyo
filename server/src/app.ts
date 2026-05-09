import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import authRouter from "./routes/auth.routes.js";
import logger from "./middlewares/logger.js";
import listingRouter from "./routes/listing.routes.js";
import { initSocket } from "./chat/chat.js";
import chatRouter from "./routes/chat.routes.js";
import offerRouter from "./routes/offer.routes.js";
import saveRouter from "./routes/save.routes.js";
import errorHandler from "./middlewares/error.handler.js";

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

// Middlewares
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use(logger);

// Routes
app.get("/", (req: Request, res: Response) => {
  return res.send("Feriyo");
});
app.use("/api/auth", authRouter);
app.use("/api/listings", listingRouter);
app.use("/api/chats", chatRouter);
app.use("/api/offers", offerRouter);
app.use("/api/saves", saveRouter);

app.use(errorHandler);

export default httpServer;
