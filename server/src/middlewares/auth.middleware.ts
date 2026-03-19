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

  console.log(token);
  try {
    const payload = jwt.decode(token);
    console.log("Decoded (no verify):", payload);
    console.log("Server time (seconds):", Math.floor(Date.now() / 1000));
    const decodedPayload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as JwtPayload;
    req.user = { userId: Number(decodedPayload.sub) };
    console.log(decodedPayload);
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

export { protect };

