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

const getCustomerDashboard = async (user: JwtPayload) => {
  const customer = await prisma.customer.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  // Get only PAID orders
  const orders = await prisma.order.findMany({
    where: {
      customerId: customer.id,
      status: "PAID", // Only include paid orders
    },
    include: {
      orderItems: true,
    },
  });

  // Get recent product views
  const recentViews = await prisma.recentView.findMany({
    where: {
      customerId: customer.id,
    },
    include: {
      product: true,
    },
    orderBy: {
      viewedAt: "desc",
    },
    take: 10,
  });

  // Get review count
  const reviewCount = await prisma.review.count({
    where: {
      customerId: customer.id,
    },
  });

  // Calculate order status distribution - keep all statuses for visibility
  const ordersByStatus = await prisma.order.groupBy({
    by: ["status"],
    where: {
      customerId: customer.id,
    },
    _count: true,
  });

  // Calculate total spent - only from paid orders
  const totalSpent = orders.reduce(
    (acc, order) => acc + Number(order.totalAmount),
    0
  );

  // Process orders for trend chart - only paid orders
  const orderTrends = orders.reduce((acc: { [key: string]: number }, order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += Number(order.totalAmount);
    return acc;
  }, {});

  // Format data for frontend
  const dashboardData = {
    analytics: {
      totalOrders: orders.length, // Now represents only paid orders
      totalSpent: totalSpent.toFixed(2),
      totalProductsViewed: recentViews.length,
      totalReviews: reviewCount,
    },
    orders: Object.entries(orderTrends).map(([date, amount]) => ({
      date,
      amount,
    })),
    recentViews: recentViews.map((view) => ({
      id: view.id,
      product: {
        name: view.product.name,
      },
      type: "Viewed",
      date: view.viewedAt,
      status: "Completed",
    })),
    ordersByStatus: ordersByStatus.map((status) => ({
      status: status.status,
      value: status._count,
    })),
  };

  return dashboardData;
};

export const getVendorDashboard = async (user: JwtPayload) => {
  const vendor = await prisma.vendor.findUniqueOrThrow({
    where: { email: user?.email },
  });

  // Get only PAID orders
  const orders = await prisma.order.findMany({
    where: {
      vendorId: vendor.id,
      status: "PAID", // Only include paid orders
    },
    include: {
      orderItems: {
        include: { product: true },
      },
      customer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Get product performance
  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    include: {
      Review: true,
      OrderItem: {
        include: {
          order: true, // Include order to check status
        },
      },
    },
  });

  // Calculate revenue metrics - only from paid orders
  const revenueData = orders.reduce((acc: { [key: string]: number }, order) => {
    const month = new Date(order.createdAt).toLocaleString("default", {
      month: "short",
    });
    if (!acc[month]) acc[month] = 0;
    acc[month] += Number(order.totalAmount);
    return acc;
  }, {});

  // Calculate product performance metrics - only from paid orders
  const productPerformance = products.map((product) => ({
    name: product.name,
    revenue: product.OrderItem.reduce(
      (acc, item) =>
        acc +
        (item.order.status === "PAID" ? Number(item.price) * item.quantity : 0),
      0
    ),
    units: product.OrderItem.reduce(
      (acc, item) => acc + (item.order.status === "PAID" ? item.quantity : 0),
      0
    ),
    rating: product.averageRating,
  }));

  // Get customer retention data - only from paid orders
  const customerRetention = await prisma.order.groupBy({
    by: ["customerId"],
    where: {
      vendorId: vendor.id,
      status: "PAID",
    },
    _count: true,
  });

  // Calculate review metrics
  const reviewMetrics = await prisma.review.groupBy({
    by: ["rating"],
    where: { vendorId: vendor.id },
    _count: true,
  });

  // Format dashboard data
  const dashboardData = {
    analytics: {
      totalRevenue: orders.reduce(
        (acc, order) => acc + Number(order.totalAmount),
        0
      ),
      totalOrders: orders.length,
      totalProducts: products.length,
      averageOrderValue: orders.length
        ? orders.reduce((acc, order) => acc + Number(order.totalAmount), 0) /
          orders.length
        : 0,
      totalCustomers: new Set(orders.map((order) => order.customerId)).size,
      averageRating:
        products.reduce((acc, product) => acc + product.averageRating, 0) /
        products.length,
    },
    revenueChart: Object.entries(revenueData).map(([month, amount]) => ({
      month,
      amount: Number(amount.toFixed(2)),
    })),
    productPerformance: productPerformance
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10),
    customerRetention: {
      oneTime: customerRetention.filter((c) => c._count === 1).length,
      repeat: customerRetention.filter((c) => c._count > 1).length,
    },
    reviewDistribution: reviewMetrics.map((metric) => ({
      rating: metric.rating,
      count: metric._count,
    })),
    recentOrders: orders.slice(0, 10).map((order) => ({
      id: order.id,
      customer: order.customer.name,
      amount: order.totalAmount,
      status: order.status,
      date: order.createdAt,
    })),
  };

  return dashboardData;
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
  getAllVendors,
  getCustomerDashboard,
  getVendorDashboard,
};
