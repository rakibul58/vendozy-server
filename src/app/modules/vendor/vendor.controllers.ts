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

const getVendorShop = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorServices.getVendorShopFromDB(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Vendor Retrieved successfully!",
    data: result,
  });
});

const followVendorShop = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await VendorServices.followShopsInDB(
      req?.user,
      req.params.id
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Vendor Follow Status updated!",
      data: result,
    });
  }
);

const getFollowStatus = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await VendorServices.getFollowStatusFromDB(
      req?.user,
      req.params.id
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Follow Status Fetched!",
      data: result,
    });
  }
);

export const VendorControllers = {
  vendorOnboarding,
  getVendorShop,
  followVendorShop,
  getFollowStatus,
};
