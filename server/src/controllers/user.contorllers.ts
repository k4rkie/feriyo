import type { Request, Response, NextFunction } from "express";
import { getUserProfile } from "../services/user.services.js";
import { NotFoundError } from "../errors/index.js";

const userProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("Req params: ", req.params);
  try {
    const { username } = req.params;
    console.log("Username: ", username);
    const userId = req.user?.userId;
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
        data: null,
        error: "Username is required",
      });
    }
    const profileData = await getUserProfile(String(username), userId);
    return res.status(201).json({
      success: true,
      message: "User profile fetched successfully",
      data: { ...profileData },
      error: null,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        success: false,
        message: "Profile Fetch Error",
        data: null,
        error: error.message,
      });
    }
    next(error);
  }
};

export { userProfileController };
