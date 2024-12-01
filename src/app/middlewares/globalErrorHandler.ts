import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || "Something went wrong!",
    error: err,
  });
};

export default globalErrorHandler;
