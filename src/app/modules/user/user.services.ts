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
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";

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

  const result = await prisma.$transaction(async (transactionClient) => {
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

  return result;
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

  const result = await prisma.$transaction(async (transactionClient) => {
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
  });

  return result;
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

const updateAdminProfile = async (
  user: JwtPayload,
  payload: { name: string; phone: string }
) => {
  const admin = await prisma.admin.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });
  const { name, phone } = payload;

  const updatedAdmin = await prisma.admin.update({
    where: { id: admin.id },
    data: {
      name,
      phone,
    },
    include: {
      user: {
        select: {
          email: true,
          role: true,
          status: true,
        },
      },
    },
  });

  return updatedAdmin;
};

const updateVendorProfile = async (
  user: JwtPayload,
  payload: {
    name?: string;
    phone?: string;
    logo?: string;
    description?: string;
  }
) => {
  const vendor = await prisma.vendor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });
  const { name, phone, logo, description } = payload;

  const updatedVendor = await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      name,
      phone,
      logo,
      description,
      isOnboarded: true,
    },
    include: {
      user: {
        select: {
          email: true,
          role: true,
          status: true,
        },
      },
    },
  });

  return updatedVendor;
};

const updateCustomerProfile = async (
  user: JwtPayload,
  payload: {
    name?: string;
    phone?: string;
    address?: string;
    profileImg?: string;
  }
) => {
  const customer = await prisma.customer.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });
  const { name, phone, address, profileImg } = payload;

  const updatedCustomer = await prisma.customer.update({
    where: { id: customer.id },
    data: {
      name,
      phone,
      address,
      profileImg,
    },
    include: {
      user: {
        select: {
          email: true,
          role: true,
          status: true,
        },
      },
    },
  });

  return updatedCustomer;
};

const toggleVendorStatus = async (userId: string) => {
  const result = await prisma.$transaction(async (transactionClient) => {
    // Fetch the current user and vendor statuses
    const user = await transactionClient.user.findUniqueOrThrow({
      where: { id: userId },
      select: { status: true },
    });

    // Toggle statuses
    const newUserStatus = user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    const newVendorStatus =
      user.status === "SUSPENDED" ? "ACTIVE" : "BLACKLISTED";

    // Update user status
    await transactionClient.user.update({
      where: {
        id: userId,
      },
      data: {
        status: newUserStatus,
      },
    });

    // Update vendor status
    const updatedVendor = await transactionClient.vendor.update({
      where: { userId },
      data: {
        status: newVendorStatus,
      },
    });

    return updatedVendor;
  });

  return result;
};

const toggleCustomerStatus = async (userId: string) => {
  const result = await prisma.$transaction(async (transactionClient) => {
    // Fetch the current user and vendor statuses
    const user = await transactionClient.user.findUniqueOrThrow({
      where: { id: userId },
      select: { status: true },
    });

    // Toggle statuses
    const newUserStatus = user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    const isDeleted = user.status === "SUSPENDED" ? false : true;

    // Update user status
    await transactionClient.user.update({
      where: {
        id: userId,
      },
      data: {
        status: newUserStatus,
      },
    });

    // Update vendor status
    const updatedVendor = await transactionClient.customer.update({
      where: { userId },
      data: {
        isDeleted: isDeleted,
      },
    });

    return updatedVendor;
  });

  return result;
};

const getAllCustomers = async (options: IPaginationOptions) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    skip,
    take: limit,
    include: {
      customer: true,
    },
  });

  const total = await prisma.user.count({
    where: { role: "CUSTOMER" },
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

const getAllVendors = async (options: IPaginationOptions) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.user.findMany({
    where: { role: "VENDOR" },
    skip,
    take: limit,
    include: {
      vendor: true,
    },
  });

  const total = await prisma.user.count({
    where: { role: "VENDOR" },
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

export const UserServices = {
  createAdminInDb,
  createVendorInDB,
  createCustomerInDB,
  getUserProfileFromDB,
  updateAdminProfile,
  updateVendorProfile,
  updateCustomerProfile,
  toggleCustomerStatus,
  toggleVendorStatus,
  getAllCustomers,
  getAllVendors
};
