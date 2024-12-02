import { NextFunction, Request, Response } from "express";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import config from "../../config";
import { JwtPayload, Secret } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError";
import prisma from "../../shared/prisma";
import { UserStatus } from "@prisma/client";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
      }

      let verifiedUser: JwtPayload;
      try {
        verifiedUser = jwtHelpers.verifyToken(
          token,
          config.jwt.jwt_secret as Secret
        );
      } catch (error) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Your token is invalid!");
      }

      req.user = verifiedUser;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "You can't access this route!"
        );
      }

      // checking user exists in the DB
      const userData = await prisma.user.findUniqueOrThrow({
        where: {
          email: verifiedUser.email,
        },
      });

      // checking if the user is suspended
      if (userData.status === UserStatus.SUSPENDED) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "Your Account has been suspended!"
        );
      }

      // checking if the user is deleted
      if (userData.status === UserStatus.DELETED) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "Your Account has been deleted!"
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
