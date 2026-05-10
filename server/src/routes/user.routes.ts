import { Router } from "express";
import { userProfileController } from "../controllers/user.contorllers.js";
import { attachUser } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/:username", attachUser, userProfileController);

export default userRouter;
