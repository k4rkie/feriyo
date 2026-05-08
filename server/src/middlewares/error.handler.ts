import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  console.error(`[Error] ${err.name}: ${message}`);

  return res.status(statusCode).json({
    success: false,
    message: message,
    data: null,
    error: err.name || "Error",
  });
};

export default errorHandler;
