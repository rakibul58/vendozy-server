import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { OrderServices } from "./order.services";
import { StatusCodes } from "http-status-codes";
import { VerifyCheckoutQuery } from "./order.interface";
import pick from "../../../shared/pick";

const initiatePayment = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await OrderServices.initiateCheckoutInDB(req.user, req.body);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Payment Initiated successfully!",
      data: result,
    });
  }
);

const verifyPayment = catchAsync(async (req, res) => {
  const result = await OrderServices.verifyCheckoutInDB(
    req.query as unknown as VerifyCheckoutQuery
  );
  res.send(result);
});

const getCustomerOrders = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await OrderServices.getCustomerOrdersFromDB(
      req?.user,
      options
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Orders retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getAdminOrders = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await OrderServices.getAdminOrdersFromDB(req?.user, options);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Orders retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const addReview = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await OrderServices.addReviewsInDB(req?.user, req.body);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Review added successfully",
      data: result,
    });
  }
);

const addReply = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await OrderServices.addReviewReplyInDB(req?.user, req.body);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Reply added successfully",
      data: result,
    });
  }
);

const getVendorReviews = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await OrderServices.getVendorReviews(req?.user, options);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Reviews retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getAdminReviews = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await OrderServices.getAdminReviews(req?.user, options);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Reviews retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

export const OrderControllers = {
  initiatePayment,
  verifyPayment,
  getCustomerOrders,
  addReview,
  addReply,
  getVendorReviews,
  getAdminReviews,
  getAdminOrders
};
