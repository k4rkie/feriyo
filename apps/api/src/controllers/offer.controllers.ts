import { Request, Response, NextFunction } from "express";
import { updateOfferStatus } from "../services/offer.services.js";
import { updateOfferStatusSchema } from "../validators/offer.validator.js";

export const updateOfferStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const offerId = String(req.params.offerId);
  const userId = req.user!.userId;

  const parsedBody = updateOfferStatusSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid offer status",
      data: null,
      error: parsedBody.error.flatten().fieldErrors,
    });
  }

  const { status } = parsedBody.data;

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
