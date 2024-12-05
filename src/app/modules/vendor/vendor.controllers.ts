import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { VendorServices } from "./vendor.services";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";

const vendorOnboarding = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await VendorServices.vendorOnboardingInDB(
      req.user,
      req.body
    );
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Vendor onboarded successfully!",
      data: result,
    });
  }
);

export const VendorControllers = {
  vendorOnboarding,
};
