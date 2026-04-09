import { Request, Response, NextFunction } from "express";
import {
  createListing,
  deleteListing,
  editListing,
  getListingById,
  getListings,
  myListings,
} from "../services/listing.services.js";
import multer from "multer";
import {
  createListingSchema,
  editListingSchema,
} from "../validators/listings.validator.js";
import { getUserInfo } from "../services/auth.services.js";
import { NotFoundError, UnauthorizedError } from "../errors/index.js";

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
  const userId = req.user!.userId;
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
  try {
    const new_listing = await createListing(result.data, userId);
    return res.status(201).json({
      success: true,
      message: "New listing created",
      data: { new_listing },
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
      message: "Listing fetched successfully",
      data: listing,
      error: null,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        success: false,
        message: "Listing fetch Error",
        data: null,
        error: error.message,
      });
    }
    return res.status(400).json({
      success: false,
      message: "Listing fetch error",
      data: null,
      error: error,
    });
  }
};

const editListingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const listingId = Number(req.params.listingId);
  const userId = req.user!.userId;

  const isSold = req.body.isSold === "true" || req.body.isSold === true;

  let removedListingImages = req.body.removedListingImages;
  if (!removedListingImages) {
    removedListingImages = [];
  } else if (typeof removedListingImages === "string") {
    removedListingImages = [removedListingImages];
  }
  req.body = { ...req.body, isSold, removedListingImages };

  const requestData = { ...req.body, newListingImages: req.files };
  const result = editListingSchema.safeParse(requestData);

  if (!result.success) {
    const { fieldErrors } = result.error.flatten();
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      data: null,
      error: fieldErrors,
    });
  }
  try {
    const editedListing = await editListing(result.data, listingId, userId);
    return res.status(201).json({
      success: true,
      message: "Listing edited successfully",
      data: { editedListing },
      error: null,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        success: false,
        message: "Listing Editing Error",
        data: null,
        error: error.message,
      });
    }

    if (error instanceof UnauthorizedError) {
      return res.status(error.statusCode).json({
        success: false,
        message: "Listing Editing Error",
        data: null,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: null,
      error: null,
    });
  }
};

const deleteListingContorller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const listingId = Number(req.params.listingId);
  const userId = req.user!.userId;
  try {
    const listingDeleted = await deleteListing(listingId, userId);
    res.status(200).json({
      success: true,
      message: "Listing deleted!",
      data: null,
      error: null,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        success: false,
        message: "Listing Deletion Error",
        data: null,
        error: error.message,
      });
    }

    if (error instanceof UnauthorizedError) {
      return res.status(error.statusCode).json({
        success: false,
        message: "Listing Deletion Error",
        data: null,
        error: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: null,
      error: null,
    });
  }
};

const getMyListings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.userId;
  try {
    const listings = await myListings(userId!);

    return res.status(200).json({
      success: true,
      message: "Listings fetched successfully",
      data: listings,
      error: null,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        success: false,
        message: "Listing Fetch Error",
        data: null,
        error: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: null,
      error: null,
    });
  }
};

export {
  getListingsController,
  createListingContorller,
  getListingByIdController,
  editListingController,
  deleteListingContorller,
  getMyListings,
};
