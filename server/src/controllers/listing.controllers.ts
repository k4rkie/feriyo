import { Request, Response, NextFunction } from "express";
import {
  createListing,
  getListingById,
  getListings,
} from "../services/listing.services.js";
import multer from "multer";
import { createListingSchema } from "../validators/listings.validator.js";
import { getUserInfo } from "../services/auth.services.js";

const getListingsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const listings = await getListings();
    return res.status(200).json({
      success: true,
      message: "Listings fetched successfully",
      data: listings,
      error: null,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Listings fetching error",
      data: null,
      error: error,
    });
  }
};

const createListingContorller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestData = { ...req.body, listingImages: req.files };
  const result = createListingSchema.safeParse(requestData);
  if (!result.success) {
    const { fieldErrors } = result.error.flatten();
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      data: null,
      error: fieldErrors,
    });
  }
  console.log(req.files);
  try {
    const new_listing = await createListing(result.data, req.user!.userId);
    return res.status(201).json({
      success: true,
      message: "New listing created",
      data: null,
      error: null,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      data: null,
      error: error,
    });
  }
};

const getListingByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const listingId = Number(req.params.listingId);
    const listing = await getListingById(listingId);
    return res.status(200).json({
      success: true,
      message: "New listing created",
      data: listing,
      error: null,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      data: null,
      error: error,
    });
  }
};
export {
  getListingsController,
  createListingContorller,
  getListingByIdController,
};
