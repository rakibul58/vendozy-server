import { Coupon, Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { TCouponFilterRequest, TCouponPayload } from "./coupon.interface";

const createCouponInDB = async (payload: TCouponPayload): Promise<Coupon> => {
  if (new Date(payload.startDate) > new Date(payload.endDate)) {
    throw new Error("Start date cannot be after end date");
  }

  const result = await prisma.coupon.create({
    data: payload,
  });

  return result;
};

const getAllCouponFromDB = async (
  filters: TCouponFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, isActive, ...filterData } = filters;

  const andConditions: Prisma.CouponWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["code", "description"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (isActive !== undefined) {
    andConditions.push({
      isActive: isActive === "true" ? true : false,
    });
  }

  // Add date range filter for valid coupons
  if (filters.validNow === "true") {
    const currentDate = new Date();
    andConditions.push({
      AND: [
        {
          startDate: {
            lte: currentDate,
          },
        },
        {
          endDate: {
            gte: currentDate,
          },
        },
      ],
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.CouponWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.coupon.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });

  const total = await prisma.coupon.count({
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

const getCouponByIdFromDB = async (id: string): Promise<Coupon> => {
  const result = await prisma.coupon.findUniqueOrThrow({
    where: {
      id,
    },
  });

  return result;
};

const updateCouponInDB = async (
  id: string,
  data: Partial<TCouponPayload>
): Promise<Coupon> => {
  if (data.startDate && data.endDate) {
    if (new Date(data.startDate) > new Date(data.endDate)) {
      throw new Error("Start date cannot be after end date");
    }
  }

  await prisma.coupon.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.coupon.update({
    where: {
      id,
    },
    data,
  });

  return result;
};

const deleteCouponFromDB = async (id: string): Promise<Coupon> => {
  const result = await prisma.coupon.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });

  return result;
};

export const CouponServices = {
  createCouponInDB,
  getAllCouponFromDB,
  getCouponByIdFromDB,
  updateCouponInDB,
  deleteCouponFromDB,
};
