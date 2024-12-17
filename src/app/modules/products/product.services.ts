import { Prisma, Product, UserRole } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { TProductFilterRequest } from "./product.interface";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { productSearchableFields } from "./product.constants";
import { JwtPayload } from "jsonwebtoken";

const createProductInDB = async (payload: Product): Promise<Product> => {
  await prisma.vendor.findUniqueOrThrow({
    where: {
      id: payload.vendorId,
    },
  });
  const result = await prisma.product.create({
    data: payload,
  });

  return result;
};

const getAllProductFromDB = async (
  filters: TProductFilterRequest,
  options: IPaginationOptions,
  user?: JwtPayload
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const {
    searchTerm,
    category,
    vendor,
    isFlashSale,
    minPrice,
    maxPrice,
    ...filterData
  } = filters;

  // Array to store all conditions
  const andConditions: Prisma.ProductWhereInput[] = [];

  // Add search term condition
  if (searchTerm) {
    andConditions.push({
      OR: productSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // Add category filter
  if (category) {
    andConditions.push({
      category: {
        name: {
          contains: category,
          mode: "insensitive",
        },
      },
    });
  }

  // Add vendor filter
  if (vendor) {
    andConditions.push({
      vendor: {
        name: {
          contains: vendor,
          mode: "insensitive",
        },
      },
    });
  }

  if (isFlashSale) {
    andConditions.push({
      isFlashSale: isFlashSale === "true",
    });
  }

  // Add minPrice and maxPrice filters
  if (minPrice !== undefined) {
    andConditions.push({
      price: {
        gte: parseFloat(minPrice), // Ensure it's a number
      },
    });
  }

  if (maxPrice !== undefined) {
    andConditions.push({
      price: {
        lte: parseFloat(maxPrice), // Ensure it's a number
      },
    });
  }

  // Add additional filter conditions
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  // Exclude deleted records
  andConditions.push({
    isDeleted: false,
    vendor: {
      AND: [{ isDeleted: false }, { status: "ACTIVE" }],
    },
  });

  // Fetch followed shop IDs if user is logged in and a customer
  let followedShopIds: string[] = [];
  if (user?.email && user?.role === UserRole.CUSTOMER) {
    const customer = await prisma.customer.findUnique({
      where: { email: user?.email },
      include: {
        shopsFollowed: {
          select: {
            vendorId: true,
          },
        },
      },
    });
    followedShopIds =
      customer?.shopsFollowed.map((shop) => shop.vendorId) || [];
  }

  // Prepare result and total
  let result: any[] = [];
  let total = 0;

  // Construct base where conditions
  const baseWhereInput: Prisma.ProductWhereInput = {
    AND: andConditions,
  };

  // If user follows shops, first fetch their products
  if (followedShopIds.length > 0) {
    const followedShopWhereInput: Prisma.ProductWhereInput = {
      ...baseWhereInput,
      vendor: {
        id: {
          in: followedShopIds,
        },
      },
    };

    // Fetch followed shop products
    const followedShopProducts = await prisma.product.findMany({
      where: followedShopWhereInput,
      skip,
      take: limit,
      orderBy:
        options.sortBy && options.sortOrder
          ? { [options.sortBy]: options.sortOrder }
          : { createdAt: "desc" },
      include: {
        category: true,
        vendor: true,
      },
    });

    // Count followed shop products
    const followedShopProductsCount = await prisma.product.count({
      where: followedShopWhereInput,
    });

    // If followed shop products are less than limit, fetch remaining from other shops
    if (followedShopProducts.length < limit) {
      const remainingLimit = limit - followedShopProducts.length;

      const otherShopWhereInput: Prisma.ProductWhereInput = {
        ...baseWhereInput,
        vendor: {
          id: {
            notIn: followedShopIds,
          },
        },
      };

      const otherShopProducts = await prisma.product.findMany({
        where: otherShopWhereInput,
        skip,
        take: remainingLimit,
        orderBy:
          options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { createdAt: "desc" },
        include: {
          category: true,
          vendor: true,
        },
      });

      // Combine products
      result = [...followedShopProducts, ...otherShopProducts];

      // Count total other shop products
      const otherShopProductsCount = await prisma.product.count({
        where: otherShopWhereInput,
      });

      total = followedShopProductsCount + otherShopProductsCount;
    } else {
      result = followedShopProducts;
      total = followedShopProductsCount;
    }
  } else {
    // If no followed shops, fetch normally
    result = await prisma.product.findMany({
      where: baseWhereInput,
      skip,
      take: limit,
      orderBy:
        options.sortBy && options.sortOrder
          ? { [options.sortBy]: options.sortOrder }
          : { createdAt: "desc" },
      include: {
        category: true,
        vendor: true,
      },
    });

    total = await prisma.product.count({
      where: baseWhereInput,
    });
  }

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getProductByIdFromDB = async (user: JwtPayload, id: string) => {
  // Fetch product details
  const product = await prisma.product.findUniqueOrThrow({
    where: { id },
    include: {
      category: true,
      vendor: true,
      Review: {
        include: {
          customer: true,
          replies: true,
        },
        take: 5,
      },
    },
  });

  if (user?.role == UserRole.CUSTOMER && user?.email) {
    const customer = await prisma.customer.findUniqueOrThrow({
      where: { email: user?.email },
    });
    await prisma.recentView.upsert({
      where: {
        customerId_productId: {
          customerId: customer?.id,
          productId: id,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        customerId: customer.id,
        productId: id,
      },
    });
  }

  // Fetch related products in the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: id },
      isDeleted: false,
    },
    take: 4,
  });

  return { product, relatedProducts };
};

export const ProductServices = {
  createProductInDB,
  getAllProductFromDB,
  getProductByIdFromDB
};
