import { Router } from "express";
import { updateOfferStatusController } from "../controllers/offer.controllers.js";
import { protect } from "../middlewares/auth.middleware.js";

const offerRouter = Router();

offerRouter.patch("/:offerId/status", protect, updateOfferStatusController);

export default offerRouter;
