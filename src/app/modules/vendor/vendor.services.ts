import { JwtPayload } from "jsonwebtoken";
import { TVendorOnboardingPayload } from "./vendor.interface";
import prisma from "../../../shared/prisma";

const vendorOnboardingInDB = async (
  user: JwtPayload,
  payload: TVendorOnboardingPayload
) => {
  const result = await prisma.$transaction(async (transactionClient) => {
    const vendorUpdate = await transactionClient.vendor.update({
      where: {
        email: user.email,
      },
      data: { ...payload.vendor, isOnboarded: true },
    });

    await transactionClient.product.create({
      data: payload.product,
    });

    return vendorUpdate;
  });

  return result;
};

const getVendorShopFromDB = async (vendorId: string) => {
  const vendor = await prisma.vendor.findUniqueOrThrow({
    where: { id: vendorId },
    include: {
      _count: {
        select: { shopFollowers: true },
      },
    },
  });

  const productCount = await prisma.product.count({
    where: { vendorId: vendorId },
  });

  return {
    ...vendor,
    followerCount: vendor._count.shopFollowers,
    productCount,
  };
};

const followShopsInDB = async (user: JwtPayload, vendorId: string) => {
  const customer = await prisma.customer.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  // Check if already following
  const existingFollow = await prisma.shopFollower.findUnique({
    where: {
      customerId_vendorId: {
        customerId: customer?.id,
        vendorId,
      },
    },
  });

  if (existingFollow) {
    // Unfollow
    const result = await prisma.shopFollower.delete({
      where: {
        customerId_vendorId: {
          customerId: customer?.id,
          vendorId,
        },
      },
    });

    return result;
  } else {
    // Follow
    const result = await prisma.shopFollower.create({
      data: {
        customerId: customer?.id,
        vendorId,
      },
    });

    return result;
  }
};

const getFollowStatusFromDB = async (user: JwtPayload, vendorId: string) => {
  const customer = await prisma.customer.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const followStatus = await prisma.shopFollower.findUnique({
    where: {
      customerId_vendorId: {
        customerId: customer?.id,
        vendorId,
      },
    },
  });

  return { isFollowing: !!followStatus };
};

export const VendorServices = {
  vendorOnboardingInDB,
  getVendorShopFromDB,
  followShopsInDB,
  getFollowStatusFromDB,
};
