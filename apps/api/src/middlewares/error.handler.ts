import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";
  let errorName = err.name || "Error";

  const dbCode = err.code ?? err.cause?.code;

  if (dbCode === "22P02") {
    statusCode = 400;
    message = "Invalid id format";
    errorName = "BadRequestError";
  } else if (dbCode === "23505") {
    statusCode = 409;
    message = "That value already exists";
    errorName = "DBConstraintError";
  } else if (dbCode === "23503") {
    statusCode = 400;
    message = "Referenced record does not exist";
    errorName = "BadRequestError";
  }

  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error(`[Error] ${errorName}: ${message}`, err);
  }

  const isProduction = process.env.NODE_ENV === "production";

  return res.status(statusCode).json({
    success: false,
    message: isServerError && isProduction ? "Something went wrong" : message,
    data: null,
    error: isServerError && isProduction ? "InternalServerError" : errorName,
  });
};

export default errorHandler;
