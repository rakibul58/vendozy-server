import { Category, Prisma } from "@prisma/client";
import { TCategoryFilterRequest, TCategoryPayload } from "./category.interface";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";

const createCategoryInDB = async (
  payload: TCategoryPayload
): Promise<Category> => {
  const result = await prisma.category.create({
    data: payload,
  });

  return result;
};

const getAllCategoryFromDB = async (
  filters: TCategoryFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  // there would be an array of conditions
  const andConditions: Prisma.CategoryWhereInput[] = [];

  //   adding the search term condition
  if (searchTerm) {
    andConditions.push({
      OR: ["name", "description"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  //   adding the conditions of filter data
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  //    deleted record will not be fetched
  andConditions.push({
    isDeleted: false,
  });

  //   if there is not and condition then empty object would be sent
  const whereConditions: Prisma.CategoryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.category.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });

  const total = await prisma.category.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getCategoryByIdFromDB = async (id: string) => {
  const result = await prisma.category.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  return result;
};

const updateCategoryIntoDB = async (
  id: string,
  data: Partial<TCategoryPayload>
): Promise<Category> => {
  await prisma.category.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.category.update({
    where: {
      id,
    },
    data,
  });

  return result;
};

const deleteCategoryFromDB = async (id: string): Promise<Category | null> => {
  await prisma.category.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const categoryDeletedData = await transactionClient.category.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.product.updateMany({
      where: {
        categoryId: id,
      },
      data: {
        categoryId: null,
      },
    });

    return categoryDeletedData;
  });

  return result;
};

export const CategoryServices = {
  createCategoryInDB,
  getAllCategoryFromDB,
  getCategoryByIdFromDB,
  updateCategoryIntoDB,
  deleteCategoryFromDB,
};
