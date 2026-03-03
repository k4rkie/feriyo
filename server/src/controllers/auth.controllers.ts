import { Request, Response } from "express";
import { signUpUserSchema, loginUserSchema } from "@feriyo/shared";
import {
  signUpUser,
  loginUser,
  getUserInfo,
} from "../services/auth.services.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { generateAccessToken } from "../utils/jwt.js";

const signupController = async (req: Request, res: Response) => {
  const result = signUpUserSchema.safeParse(req.body);

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
    const { newUser, accessToken, refreshToken } = await signUpUser(
      result.data,
    );
    res.cookie("refreshToken", refreshToken, {
      path: "/api/auth",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user: newUser, accessToken },
      error: null,
    });
  } catch (error: any) {
    const isEmailError = error.message.includes("email already exists");
    const isUsernameError = error.message.includes("Username already taken");

    if (isEmailError || isUsernameError) {
      return res.status(409).json({
        success: false,
        message: "Registration failed",
        data: null,
        error: {
          ...(isEmailError && {
            email: ["User with that email already exists"],
          }),
          ...(isUsernameError && { username: ["Username is already taken"] }),
        },
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
      error: null,
    });
  }
};

const loginController = async (req: Request, res: Response) => {
  const result = loginUserSchema.safeParse(req.body);

  if (!result.success) {
    const { fieldErrors } = result.error.flatten();
    return res.status(400).json({
      success: false,
      message: null,
      data: null,
      error: fieldErrors,
    });
  }
  try {
    const { loggedInUser, accessToken, refreshToken } = await loginUser(
      result.data,
    );
    res.cookie("refreshToken", refreshToken, {
      path: "/api/auth",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: { user: loggedInUser, accessToken },
      error: null,
    });
  } catch (error: any) {
    const isEmailErrorOrPasswordError = error.message.includes(
      "Invalid email or password",
    );

    if (isEmailErrorOrPasswordError) {
      return res.status(409).json({
        success: false,
        message: "Login failed",
        data: null,
        error: {
          root: ["Invalid email or passowrd"],
        },
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
      error: null,
    });
  }
};

const refreshController = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "No refresh token found",
      data: null,
      error: null,
    });
  }

  try {
    const decodedPayload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as JwtPayload;

    const userId = Number(decodedPayload.sub);

    if (!userId || isNaN(userId)) {
      return res.status(403).json({ message: "Invalid token payload" });
    }

    const accessToken = generateAccessToken(userId);

    return res.status(200).json({
      success: true,
      message: "Access Token refreshed",
      data: {
        accessToken,
      },
      error: null,
    });
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      message: "Session expired or invalid",
      data: null,
      error: error.message,
    });
  }
};

const logoutController = (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    path: "/api/auth",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: true,
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
    data: null,
    error: null,
  });
};

const meController = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthenticated: No Bearer token provided",
      data: null,
      error: "MISSING_TOKEN",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedPayload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as JwtPayload;
    const userId = Number(decodedPayload.sub);

    const user = await getUserInfo(userId);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: { user },
      error: null,
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid token",
      data: null,
      error: error.message,
    });
  }
};

export {
  signupController,
  loginController,
  refreshController,
  logoutController,
  meController,
};
