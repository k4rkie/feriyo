import express, { Router } from "express";
import {
  createListingContorller,
  getListingsController,
  getListingByIdController,
  deleteListingContorller,
  editListingController,
  getMyListings,
  makeOfferContoller,
} from "../controllers/listing.controllers.js";
import { protect } from "../middlewares/auth.middleware.js";
import { createImageUpload } from "../utils/imageUpload.js";

const upload = createImageUpload();

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
listingRouter.post(
  "/:listingId/offer",
  express.json(),
  protect,
  makeOfferContoller,
);

export default listingRouter;
