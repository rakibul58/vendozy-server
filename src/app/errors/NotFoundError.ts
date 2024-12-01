import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "Route NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested route is not found!",
    },
  });
};
