import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { OrderServices } from "./order.services";
import { StatusCodes } from "http-status-codes";
import { VerifyCheckoutQuery } from "./order.interface";

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

export const OrderControllers = { initiatePayment, verifyPayment };
