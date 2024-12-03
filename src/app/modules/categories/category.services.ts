import { Category } from "@prisma/client";
import { TCategoryPayload } from "./category.interface";
import prisma from "../../../shared/prisma";

const createCategoryInDB = async (
  payload: TCategoryPayload
): Promise<Category> => {
  const result = await prisma.category.create({
    data: payload,
  });

  return result;
};

export const CategoryServices = {
  createCategoryInDB,
};
