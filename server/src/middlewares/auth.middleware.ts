import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const protect = (req: Request, res: Response, next: NextFunction) => {
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
    const payload = jwt.decode(token);
    const decodedPayload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as JwtPayload;
    req.user = { userId: String(decodedPayload.sub) };
    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid token",
      data: null,
      error: error.message,
    });
  }
};

const attachUser = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decodedPayload = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!,
      ) as JwtPayload;
      req.user = { userId: String(decodedPayload.sub) };
    } catch (error) {
      //ignore the exception just set req.user to undefined
    }
  }
  next();
};

export { protect, attachUser };
