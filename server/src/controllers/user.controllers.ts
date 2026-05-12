import type { Request, Response, NextFunction } from "express";
import { getUserProfile, editProfile } from "../services/user.services.js";
import { NotFoundError } from "../errors/index.js";
import { editProfileSchema } from "../validators/user.validator.js";

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

const editProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user!.userId;
  const requestData = { ...req.body, avatar: req.file || null };

  const result = editProfileSchema.safeParse(requestData);

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
    const updatedUser = await editProfile(result.data, userId);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export { userProfileController, editProfileController };
