import { Router } from "express";
import { toggleSaveController, getSavedController } from "../controllers/save.controllers.js";
import { protect } from "../middlewares/auth.middleware.js";

const saveRouter = Router();

saveRouter.get("/", protect, getSavedController);
saveRouter.post("/:listingId", protect, toggleSaveController);

export default saveRouter;
