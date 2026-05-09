import { Request, Response, NextFunction } from "express";
import { toggleSaveListing, getSavedListings } from "../services/save.services.js";

export const toggleSaveController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { listingId } = req.params;
  const userId = req.user!.userId;

  try {
    const result = await toggleSaveListing(listingId, userId);
    return res.status(200).json({
      success: true,
      message: result.saved ? "Listing saved" : "Listing unsaved",
      data: result,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user!.userId;

  try {
    const listings = await getSavedListings(userId);
    return res.status(200).json({
      success: true,
      message: "Saved listings fetched",
      data: listings,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
