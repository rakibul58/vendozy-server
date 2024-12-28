"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const config_1 = __importDefault(require("../../../config"));
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const createAdminInDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt.hash(payload.password, Number(config_1.default.salt_rounds));
    const userData = {
        email: payload.admin.email,
        password: hashedPassword,
        role: client_1.UserRole.ADMIN,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const userInsertData = yield transactionClient.user.create({
            data: userData,
        });
        const createdAdminData = yield transactionClient.admin.create({
            data: Object.assign({ userId: userInsertData.id }, payload.admin),
        });
        return createdAdminData;
    }));
    return result;
});
const createVendorInDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt.hash(payload.password, Number(config_1.default.salt_rounds));
    const userData = {
        email: payload.vendor.email,
        password: hashedPassword,
        role: client_1.UserRole.VENDOR,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const userInsertData = yield transactionClient.user.create({
            data: userData,
        });
        const createdVendorData = yield transactionClient.vendor.create({
            data: Object.assign({ userId: userInsertData.id }, payload.vendor),
        });
        return createdVendorData;
    }));
    return result;
});
const createCustomerInDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt.hash(payload.password, Number(config_1.default.salt_rounds));
    const userData = {
        email: payload.customer.email,
        password: hashedPassword,
        role: client_1.UserRole.CUSTOMER,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const userInsertData = yield transactionClient.user.create({
            data: userData,
        });
        const createdVendorData = yield transactionClient.customer.create({
            data: Object.assign({ userId: userInsertData.id }, payload.customer),
        });
        return createdVendorData;
    }));
    return result;
});
const getUserProfileFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    if (user.role === client_1.UserRole.ADMIN) {
        return prisma_1.default.admin.findUniqueOrThrow({
            where: {
                email: user.email,
            },
        });
    }
    else if (user.role === client_1.UserRole.VENDOR) {
        return prisma_1.default.vendor.findUniqueOrThrow({
            where: {
                email: user.email,
            },
        });
    }
    else
        return prisma_1.default.customer.findUniqueOrThrow({
            where: {
                email: user.email,
            },
        });
});
const updateAdminProfile = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield prisma_1.default.admin.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    const { name, phone } = payload;
    const updatedAdmin = yield prisma_1.default.admin.update({
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
});
const updateVendorProfile = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const vendor = yield prisma_1.default.vendor.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    const { name, phone, logo, description } = payload;
    const updatedVendor = yield prisma_1.default.vendor.update({
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
});
const updateCustomerProfile = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield prisma_1.default.customer.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    const { name, phone, address, profileImg } = payload;
    const updatedCustomer = yield prisma_1.default.customer.update({
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
});
const toggleVendorStatus = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        // Fetch the current user and vendor statuses
        const user = yield transactionClient.user.findUniqueOrThrow({
            where: { id: userId },
            select: { status: true },
        });
        // Toggle statuses
        const newUserStatus = user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
        const newVendorStatus = user.status === "SUSPENDED" ? "ACTIVE" : "BLACKLISTED";
        // Update user status
        yield transactionClient.user.update({
            where: {
                id: userId,
            },
            data: {
                status: newUserStatus,
            },
        });
        // Update vendor status
        const updatedVendor = yield transactionClient.vendor.update({
            where: { userId },
            data: {
                status: newVendorStatus,
            },
        });
        return updatedVendor;
    }));
    return result;
});
const toggleCustomerStatus = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        // Fetch the current user and vendor statuses
        const user = yield transactionClient.user.findUniqueOrThrow({
            where: { id: userId },
            select: { status: true },
        });
        // Toggle statuses
        const newUserStatus = user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
        const isDeleted = user.status === "SUSPENDED" ? false : true;
        // Update user status
        yield transactionClient.user.update({
            where: {
                id: userId,
            },
            data: {
                status: newUserStatus,
            },
        });
        // Update vendor status
        const updatedVendor = yield transactionClient.customer.update({
            where: { userId },
            data: {
                isDeleted: isDeleted,
            },
        });
        return updatedVendor;
    }));
    return result;
});
const getAllCustomers = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const result = yield prisma_1.default.user.findMany({
        where: { role: "CUSTOMER" },
        skip,
        take: limit,
        include: {
            customer: true,
        },
    });
    const total = yield prisma_1.default.user.count({
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
});
const getAllVendors = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const result = yield prisma_1.default.user.findMany({
        where: { role: "VENDOR" },
        skip,
        take: limit,
        include: {
            vendor: true,
        },
    });
    const total = yield prisma_1.default.user.count({
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
});
const getCustomerDashboard = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield prisma_1.default.customer.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email
        }
    });
    // Get total orders and spent amount
    const orders = yield prisma_1.default.order.findMany({
        where: {
            customerId: customer.id,
        },
        include: {
            orderItems: true,
        },
    });
    // Get recent product views
    const recentViews = yield prisma_1.default.recentView.findMany({
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
    const reviewCount = yield prisma_1.default.review.count({
        where: {
            customerId: customer.id,
        },
    });
    // Calculate order status distribution
    const ordersByStatus = yield prisma_1.default.order.groupBy({
        by: ["status"],
        where: {
            customerId: customer.id,
        },
        _count: true,
    });
    // Calculate total spent
    const totalSpent = orders.reduce((acc, order) => acc + Number(order.totalAmount), 0);
    // Process orders for trend chart
    const orderTrends = orders.reduce((acc, order) => {
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
            totalOrders: orders.length,
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
});
exports.UserServices = {
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
    getCustomerDashboard
};
