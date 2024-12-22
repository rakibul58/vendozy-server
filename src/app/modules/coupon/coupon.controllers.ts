import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import pick from "../../../shared/pick";
import { CouponServices } from "./coupon.services";

const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponServices.createCouponInDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Coupon created successfully!",
    data: result,
  });
});

const getAllCoupon = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    "code",
    "description",
    "searchTerm",
    "discountType",
    "isActive",
    "validNow",
  ]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await CouponServices.getAllCouponFromDB(filters, options);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Coupons retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponServices.getCouponByIdFromDB(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Coupon retrieved successfully",
    data: result,
  });
});

const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponServices.updateCouponInDB(req.params.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Coupon updated successfully",
    data: result,
  });
});

const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponServices.deleteCouponFromDB(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Coupon deleted successfully",
    data: result,
  });
});

export const CouponControllers = {
  createCoupon,
  getAllCoupon,
  getSingleCoupon,
  updateCoupon,
  deleteCoupon,
};
