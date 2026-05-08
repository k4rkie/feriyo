import { Request, Response, NextFunction } from "express";
import { updateOfferStatus } from "../services/offer.services.js";
import { UnauthorizedError } from "../errors/index.js";

export const updateOfferStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { offerId } = req.params;
  const { status } = req.body;
  const userId = req.user!.userId;

  try {
    const updatedOffer = await updateOfferStatus(offerId, status, userId);
    return res.status(200).json({
      success: true,
      message: `Offer ${status} successfully`,
      data: updatedOffer,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
