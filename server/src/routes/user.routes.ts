import { Router } from "express";
import {
  userProfileController,
  editProfileController,
} from "../controllers/user.controllers.js";
import { attachUser, protect } from "../middlewares/auth.middleware.js";
import multer from "multer";
import path from "path";
import url from "url";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadsPath = path.join(__dirname, "../../uploads/images/useravatars/");
    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, fileName + fileExtension);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const userRouter = Router();

userRouter.get("/:username", attachUser, userProfileController);
userRouter.put("/me", protect, upload.single("avatar"), editProfileController);

export default userRouter;
