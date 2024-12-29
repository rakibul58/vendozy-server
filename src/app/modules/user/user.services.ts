import config from "../../../config";
import * as bcrypt from "bcrypt";
import { Admin, Customer, Prisma, UserRole, Vendor } from "@prisma/client";
import prisma from "../../../shared/prisma";
import {
  AdminDashboardData,
  TAdminPayload,
  TCustomerPayload,
  TVendorFilterRequest,
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

const getAllVendors = async (
  filters: TVendorFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.VendorWhereInput[] = [];

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

  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.VendorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.vendor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { user: { createdAt: "desc" } },
  });

  const total = await prisma.vendor.count({
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

export const getAdminDashboard = async () => {
  // Execute all top-level queries in parallel
  const [
    paidOrders,
    vendorStats,
    activeCustomerCount,
    productCount,
    pendingOnboardingCount,
  ] = await Promise.all([
    // Get summarized order data
    prisma.order.findMany({
      where: { status: "PAID" },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        customer: { select: { name: true } },
        vendor: { select: { name: true } },
        status: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    prisma.vendor.groupBy({
      by: ["status"],
      _count: true,
      where: { isDeleted: false },
    }),

    prisma.customer.count({
      where: {
        isDeleted: false,
        Order: { some: { status: "PAID" } },
      },
    }),

    prisma.product.count({
      where: { isDeleted: false },
    }),

    prisma.vendor.count({
      where: {
        isOnboarded: false,
        isDeleted: false,
      },
    }),
  ]);

  // Get top vendors using Prisma's native queries
  const topVendors = await prisma.vendor.findMany({
    where: {
      isDeleted: false,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      Order: {
        where: {
          status: "PAID",
        },
        select: {
          totalAmount: true,
        },
      },
      Review: {
        select: {
          rating: true,
        },
      },
      _count: {
        select: {
          Order: true,
        },
      },
    },
    take: 5,
  });

  // Process top vendors data
  const processedTopVendors = topVendors
    .map((vendor) => {
      const revenue = vendor.Order.reduce(
        (sum, order) => sum + parseFloat(order.totalAmount.toString()),
        0
      );
      const avgRating =
        vendor.Review.length > 0
          ? vendor.Review.reduce((sum, review) => sum + review.rating, 0) /
            vendor.Review.length
          : 0;

      return {
        id: vendor.id,
        name: vendor.name ?? "Unknown Vendor",
        revenue: Number(revenue.toFixed(2)),
        totalOrders: vendor._count.Order,
        averageRating: Number(avgRating.toFixed(2)),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // Calculate metrics
  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + parseFloat(order.totalAmount.toString()),
    0
  );

  const averageOrderValue = paidOrders.length
    ? totalRevenue / paidOrders.length
    : 0;

  const revenueByMonth = paidOrders.reduce(
    (acc: { [key: string]: number }, order) => {
      const month = new Date(order.createdAt).toLocaleString("default", {
        month: "short",
      });
      acc[month] = (acc[month] || 0) + parseFloat(order.totalAmount.toString());
      return acc;
    },
    {}
  );

  // Get total customers for inactive calculation
  const totalCustomers = await prisma.customer.count({
    where: { isDeleted: false },
  });

  // Return processed data
  return {
    analytics: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      activeVendors:
        vendorStats.find((v) => v.status === "ACTIVE")?._count ?? 0,
      totalCustomers,
      totalProducts: productCount,
      totalOrders: paidOrders.length,
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
    },
    vendorMetrics: {
      activeVendors:
        vendorStats.find((v) => v.status === "ACTIVE")?._count ?? 0,
      pendingOnboarding: pendingOnboardingCount,
      blacklisted:
        vendorStats.find((v) => v.status === "BLACKLISTED")?._count ?? 0,
    },
    revenueChart: Object.entries(revenueByMonth).map(([month, amount]) => ({
      month,
      amount: Number(amount.toFixed(2)),
    })),
    topVendors: processedTopVendors,
    customerMetrics: {
      active: activeCustomerCount,
      inactive: totalCustomers - activeCustomerCount,
    },
    recentOrders: paidOrders.map((order) => ({
      id: order.id,
      customer: order.customer.name,
      vendor: order.vendor.name ?? "Unknown Vendor",
      amount: Number(parseFloat(order.totalAmount.toString()).toFixed(2)),
      status: order.status,
      date: order.createdAt,
    })),
  };
};

const subscribeToNewsletter = async ({ email }: { email: string }) => {
  const subscriber = await prisma.newsletter.upsert({
    where: { email },
    update: { status: "SUBSCRIBED" },
    create: { email, status: "SUBSCRIBED" },
  });

  return subscriber;
};

const getAllNewsLetter = async (options: IPaginationOptions) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.newsletter.findMany({
    where: {},
    skip,
    take: limit,
  });

  const total = await prisma.newsletter.count({ where: {} });

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
  getAllVendors,
  getCustomerDashboard,
  getVendorDashboard,
  getAdminDashboard,
  subscribeToNewsletter,
  getAllNewsLetter,
};
