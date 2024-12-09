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
      data: {...payload.vendor, isOnboarded: true},
    });

    await transactionClient.product.create({
      data: payload.product,
    });

    return vendorUpdate;
  });

  return result;
};

export const VendorServices = {
  vendorOnboardingInDB,
};
