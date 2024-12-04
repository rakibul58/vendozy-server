import { NextFunction, Request, Response } from "express";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import config from "../../config";
import { Secret } from "jsonwebtoken";

export const optionalAuth = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;

  if (token) {
    try {
      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_secret as Secret
      );
      req.user = verifiedUser;
    } catch (error) {
      // If token is invalid, continue without user
      req.user = undefined;
    }
  }

  next();
};
