import { Request, Response, NextFunction } from "express";
import { contactSellerSchema } from "../validators/chat.validator.js";
import {
  contactSeller,
  getChatData,
  getChatList,
} from "../services/chat.services.js";
import { NotFoundError, UnauthorizedError } from "../errors/index.js";

const getChatListController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user!.userId;

  try {
    const chatList = await getChatList(userId);
    return res.status(200).json({
      success: true,
      message: "ChatList fetched successfully",
      data: { chatList },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

const contactSellerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user!.userId;

  const result = contactSellerSchema.safeParse(req.body);
  if (!result.success) {
    const { fieldErrors } = result.error.flatten();
    return res.status(400).json({
      success: false,
      message: "Zod Validation Error",
      data: null,
      error: fieldErrors,
    });
  }
  try {
    const chatId = await contactSeller(result.data, userId);
    return res.status(201).json({
      success: true,
      message: "Contact seller successful",
      data: { chatId },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

const getChatDataController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const chatId = String(req.params.chatId);
  const userId = req.user!.userId;
  try {
    const { chatData, messages } = await getChatData(chatId, userId);
    return res.status(200).json({
      success: true,
      message: "Chat data fetched successfully",
      data: { chatData, messages },
      error: null,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        success: false,
        message: "Chat fetch Error",
        data: null,
        error: error.message,
      });
    }
    if (error instanceof UnauthorizedError) {
      return res.status(error.statusCode).json({
        success: false,
        message: "Chat access denied",
        data: null,
        error: error.message,
      });
    }
    next(error);
  }
};

const newMessageController = async () => {};

export {
  contactSellerController,
  getChatDataController,
  newMessageController,
  getChatListController,
};
