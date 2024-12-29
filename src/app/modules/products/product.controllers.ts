import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ProductServices } from "./product.services";
import { StatusCodes } from "http-status-codes";
import pick from "../../../shared/pick";
import { productFilterableFields } from "./product.constants";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.createProductInDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Product created successfully!",
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.updateProductInDB(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product updated successfully!",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.deleteProductInDB(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product deleted successfully!",
    data: result,
  });
});

const getAllProduct = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const filters = pick(req.query, productFilterableFields);

    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await ProductServices.getAllProductFromDB(
      filters,
      options,
      req.user
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Products retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getProductById = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await ProductServices.getProductByIdFromDB(
      req.user,
      req.params.id
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Product retrieved successfully",
      data: result,
    });
  }
);

const getRecentViewProducts = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await ProductServices.getRecentViewProductsFromDB(req.user);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Products retrieved successfully",
      data: result,
    });
  }
);

export const ProductControllers = {
  createProduct,
  getAllProduct,
  getProductById,
  getRecentViewProducts,
  updateProduct,
  deleteProduct
};
