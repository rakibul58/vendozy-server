import config from "../../../config";
import * as bcrypt from "bcrypt";
import { Admin, Customer, UserRole, Vendor } from "@prisma/client";
import prisma from "../../../shared/prisma";
import {
  TAdminPayload,
  TCustomerPayload,
  TVendorPayload,
} from "./user.interface";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import { JwtPayload, Secret } from "jsonwebtoken";

const createAdminInDb = async (payload: TAdminPayload): Promise<Admin> => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.salt_rounds)
  );

  const userData = {
    email: payload.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    const userInsertData = await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: {
        userId: userInsertData.id,
        ...payload.admin,
      },
    });

    return createdAdminData;
  });

  return result;
};

const createVendorInDB = async (payload: TVendorPayload) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.salt_rounds)
  );

  const userData = {
    email: payload.vendor.email,
    password: hashedPassword,
    role: UserRole.VENDOR,
  };

  const vendorSignUp = await prisma.$transaction(async (transactionClient) => {
    const userInsertData = await transactionClient.user.create({
      data: userData,
    });

    const createdVendorData = await transactionClient.vendor.create({
      data: {
        userId: userInsertData.id,
        ...payload.vendor,
      },
    });

    return createdVendorData;
  });

  // generating access token and refresh token
  const accessToken = jwtHelpers.generateToken(
    {
      email: vendorSignUp.email,
      role: UserRole.VENDOR,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: false,
  };
};

const createCustomerInDB = async (payload: TCustomerPayload) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.salt_rounds)
  );

  const userData = {
    email: payload.customer.email,
    password: hashedPassword,
    role: UserRole.CUSTOMER,
  };

  const customerSignup = await prisma.$transaction(
    async (transactionClient) => {
      const userInsertData = await transactionClient.user.create({
        data: userData,
      });

      const createdVendorData = await transactionClient.customer.create({
        data: {
          userId: userInsertData.id,
          ...payload.customer,
        },
      });

      return createdVendorData;
    }
  );

  // generating access token and refresh token
  const accessToken = jwtHelpers.generateToken(
    {
      email: customerSignup.email,
      role: UserRole.CUSTOMER,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: false,
  };
};

const getUserProfileFromDB = async (user: JwtPayload) => {
  if (user.role === UserRole.ADMIN) {
    return prisma.admin.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });
  } else if (user.role === UserRole.VENDOR) {
    return prisma.vendor.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });
  } else
    return prisma.customer.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });
};

export const UserServices = {
  createAdminInDb,
  createVendorInDB,
  createCustomerInDB,
  getUserProfileFromDB,
};
