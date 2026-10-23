import { Router } from "express";
import {
  userProfileController,
  editProfileController,
} from "../controllers/user.controllers.js";
import { attachUser, protect } from "../middlewares/auth.middleware.js";
import { createImageUpload } from "../utils/imageUpload.js";

const upload = createImageUpload();

const userRouter = Router();

userRouter.get("/:username", attachUser, userProfileController);
userRouter.put("/me", protect, upload.single("avatar"), editProfileController);

export default userRouter;
