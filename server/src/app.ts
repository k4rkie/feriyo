import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import authRouter from "./routes/auth.routes.js";
import logger from "./middlewares/logger.js";
import listingRouter from "./routes/listing.routes.js";

const app = express();
const server = createServer(app);

// Middlewares
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use(logger);

app.get("/", (req: Request, res: Response) => {
  return res.send("Feriyo");
});

app.use("/api/auth", authRouter);
app.use("/api/listings", listingRouter);

export default server;
