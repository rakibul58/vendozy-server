import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CartServices } from "./cart.services";
import { StatusCodes } from "http-status-codes";

const addToCart = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await CartServices.addToCartInDB(req?.user, req?.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Add to Cart Successfully!",
      data: result,
    });
  }
);

const updateCartItem = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await CartServices.updateCartItemInDB(
      req?.user,
      req?.params?.cartItemId,
      req?.body?.quantity
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "CartItem updated Successfully!",
      data: result,
    });
  }
);

const removeCartItem = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await CartServices.removeFromCartInDB(
      req?.user,
      req?.params?.cartItemId
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "CartItem removed Successfully!",
      data: result,
    });
  }
);

const getCart = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await CartServices.getCartInDB(req?.user);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "CartItem Fetched Successfully!",
      data: result,
    });
  }
);

const clearCart = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await CartServices.clearCartInDB(req?.user);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "CartItem Cleared Successfully!",
      data: result,
    });
  }
);

export const CartControllers = {
  addToCart,
  updateCartItem,
  removeCartItem,
  getCart,
  clearCart
};
