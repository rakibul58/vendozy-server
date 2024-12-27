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

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Vendor in successfully!",
    data: result,
  });
});

const createCustomer = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createCustomerInDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Customer in successfully!",
    data: result,
  });
});

const getProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserServices.getUserProfileFromDB(req.user);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Profile retrieved successfully!",
      data: result,
    });
  }
);

const updateAdminProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserServices.updateAdminProfile(req.user, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Profile updated successfully!",
      data: result,
    });
  }
);

const updateVendorProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserServices.updateVendorProfile(req.user, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Profile updated successfully!",
      data: result,
    });
  }
);

const updateCustomerProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserServices.updateCustomerProfile(req.user, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Profile updated successfully!",
      data: result,
    });
  }
);

export const UserControllers = {
  createAdmin,
  createVendor,
  createCustomer,
  getProfile,
  updateAdminProfile,
  updateVendorProfile,
  updateCustomerProfile
};
