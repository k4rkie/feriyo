import { Router } from "express";
import path from "path";
import {
  createListingContorller,
  getListingsController,
  getListingByIdController,
  deleteListingContorller,
  editListingController,
  getMyListings,
} from "../controllers/listing.controllers.js";
import multer from "multer";
import { protect } from "../middlewares/auth.middleware.js";
import url from "url";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    console.log(__dirname);
    const uploadsPath = path.join(__dirname, "../../uploads/listings/images/");
    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, fileName + fileExtension);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const listingRouter = Router();

listingRouter.get("", getListingsController);
listingRouter.get("/me", protect, getMyListings);
listingRouter.post(
  "",
  protect,
  upload.array("listingImages", 5),
  createListingContorller,
);
listingRouter.get("/:listingId", getListingByIdController);
listingRouter.put(
  "/:listingId",
  protect,
  upload.array("newListingImages", 5),
  editListingController,
);
listingRouter.delete("/:listingId", protect, deleteListingContorller);

export default listingRouter;
