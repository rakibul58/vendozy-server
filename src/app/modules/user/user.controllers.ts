import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse";
import { UserServices } from "./user.services";
import config from "../../../config";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createAdminInDb(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Admin Registered successfully!",
    data: result,
  });
});

const createVendor = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createVendorInDB(req.body);
  const { refreshToken, accessToken } = result;

  res.cookie("accessToken", accessToken, {
    secure: config.env === "development" ? false : true,
    httpOnly: true,
  });

  res.cookie("refreshToken", refreshToken, {
    secure: config.env === "development" ? false : true,
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Logged in successfully!",
    data: {
      accessToken: result.accessToken,
      needPasswordChange: result.needPasswordChange,
    },
  });
});

const createCustomer = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createCustomerInDB(req.body);
  const { refreshToken, accessToken } = result;

  res.cookie("accessToken", accessToken, {
    secure: config.env === "development" ? false : true,
    httpOnly: true,
  });

  res.cookie("refreshToken", refreshToken, {
    secure: config.env === "development" ? false : true,
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Logged in successfully!",
    data: {
      accessToken: result.accessToken,
      needPasswordChange: result.needPasswordChange,
    },
  });
});

const getProfile = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await UserServices.getUserProfileFromDB(req.user);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Profile retrieved successfully!",
    data: result,
  });
});

export const UserControllers = {
  createAdmin,
  createVendor,
  createCustomer,
  getProfile
};
