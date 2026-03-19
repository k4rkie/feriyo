import express, { Router } from "express";
import {
  signupController,
  loginController,
  refreshController,
  logoutController,
} from "../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post("/signup", express.json(), signupController);
authRouter.post("/login", express.json(), loginController);
authRouter.post("/logout", express.json(), logoutController);
authRouter.get("/refresh", express.json(), refreshController);

export default authRouter;
