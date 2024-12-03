import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse";
import { UserServices } from "./user.services";

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
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Vendor Registered successfully!",
    data: result,
  });
});

const createCustomer = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createCustomerInDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Customer Registered successfully!",
    data: result,
  });
});

export const UserControllers = {
  createAdmin,
  createVendor,
  createCustomer
};
