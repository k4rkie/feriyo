import { Router } from "express";
import {
  signupController,
  loginController,
  refreshController,
  logoutController,
  meController,
} from "../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post("/signup", signupController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/refresh", refreshController);
authRouter.get("/me", meController);

export default authRouter;
