import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { CategoryServices } from "./category.services";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import pick from "../../../shared/pick";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.createCategoryInDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Category created successfully!",
    data: result,
  });
});

const getAllCategoryFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["name", "description", "searchTerm"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await CategoryServices.getAllCategoryFromDB(filters, options);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Categories retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleCategoryFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CategoryServices.getCategoryByIdFromDB(req.params.id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Category retrieved successfully",
      data: result,
    });
  }
);

export const CategoryControllers = {
  createCategory,
  getAllCategoryFromDB,
  getSingleCategoryFromDB,
};
