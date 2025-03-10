"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductServices = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const product_constants_1 = require("./product.constants");
const createProductInDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.vendor.findUniqueOrThrow({
        where: {
            id: payload.vendorId,
        },
    });
    const result = yield prisma_1.default.product.create({
        data: payload,
    });
    return result;
});
const updateProductInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.product.update({
        where: {
            id,
        },
        data: payload,
    });
    return result;
});
const deleteProductInDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.product.update({
        where: {
            id,
        },
        data: { isDeleted: true },
    });
    return result;
});
const getAllProductFromDB = (filters, options, user) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, category, vendor, isFlashSale, minPrice, maxPrice } = filters, filterData = __rest(filters, ["searchTerm", "category", "vendor", "isFlashSale", "minPrice", "maxPrice"]);
    // Array to store all conditions
    const andConditions = [];
    // Add search term condition
    if (searchTerm) {
        andConditions.push({
            OR: product_constants_1.productSearchableFields.map((field) => ({
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
                gte: parseFloat(minPrice),
            },
        });
    }
    if (maxPrice !== undefined) {
        andConditions.push({
            price: {
                lte: parseFloat(maxPrice),
            },
        });
    }
    // Add additional filter conditions
    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: filterData[key],
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
    let followedShopIds = [];
    if ((user === null || user === void 0 ? void 0 : user.email) && (user === null || user === void 0 ? void 0 : user.role) === client_1.UserRole.CUSTOMER) {
        const customer = yield prisma_1.default.customer.findUnique({
            where: { email: user === null || user === void 0 ? void 0 : user.email },
            include: {
                shopsFollowed: {
                    select: {
                        vendorId: true,
                    },
                },
            },
        });
        followedShopIds =
            (customer === null || customer === void 0 ? void 0 : customer.shopsFollowed.map((shop) => shop.vendorId)) || [];
    }
    // Construct base where conditions
    const baseWhereInput = {
        AND: andConditions,
    };
    // Prepare result and total
    let result = [];
    let total = 0;
    // If followed shops exist, prioritize their products
    if (followedShopIds.length > 0) {
        // First, check total followed shop products matching filters
        const followedShopWhereInput = Object.assign(Object.assign({}, baseWhereInput), { vendor: {
                id: {
                    in: followedShopIds,
                },
            } });
        const followedShopProductsCount = yield prisma_1.default.product.count({
            where: followedShopWhereInput,
        });
        // Check other shop products matching filters
        const otherShopWhereInput = Object.assign(Object.assign({}, baseWhereInput), { vendor: {
                id: {
                    notIn: followedShopIds,
                },
            } });
        const otherShopProductsCount = yield prisma_1.default.product.count({
            where: otherShopWhereInput,
        });
        total = followedShopProductsCount + otherShopProductsCount;
        // Fetch followed shop products
        const followedShopProducts = yield prisma_1.default.product.findMany({
            where: followedShopWhereInput,
            skip,
            take: limit,
            orderBy: options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : { createdAt: "desc" },
            include: {
                category: true,
                vendor: true,
            },
        });
        // If not enough products from followed shops, fetch from other shops
        if (followedShopProducts.length < limit) {
            const remainingLimit = limit - followedShopProducts.length;
            const otherShopProducts = yield prisma_1.default.product.findMany({
                where: otherShopWhereInput,
                skip: Math.max(0, skip - followedShopProductsCount),
                take: remainingLimit,
                orderBy: options.sortBy && options.sortOrder
                    ? { [options.sortBy]: options.sortOrder }
                    : { createdAt: "desc" },
                include: {
                    category: true,
                    vendor: true,
                },
            });
            // Combine products
            result = [...followedShopProducts, ...otherShopProducts];
        }
        else {
            result = followedShopProducts;
        }
    }
    else {
        // If no followed shops, fetch normally
        result = yield prisma_1.default.product.findMany({
            where: baseWhereInput,
            skip,
            take: limit,
            orderBy: options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : { createdAt: "desc" },
            include: {
                category: true,
                vendor: true,
            },
        });
        total = yield prisma_1.default.product.count({
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
});
const getProductByIdFromDB = (user, id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Fetch product details
    const product = yield prisma_1.default.product.findUniqueOrThrow({
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
    if ((user === null || user === void 0 ? void 0 : user.role) == client_1.UserRole.CUSTOMER && (user === null || user === void 0 ? void 0 : user.email)) {
        const customer = yield prisma_1.default.customer.findUniqueOrThrow({
            where: { email: user === null || user === void 0 ? void 0 : user.email },
        });
        yield prisma_1.default.recentView.upsert({
            where: {
                customerId_productId: {
                    customerId: customer === null || customer === void 0 ? void 0 : customer.id,
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
    const relatedProducts = yield prisma_1.default.product.findMany({
        where: {
            categoryId: product.categoryId,
            id: { not: id },
            isDeleted: false,
        },
        take: 4,
        include: {
            vendor: true,
        },
    });
    return { product, relatedProducts, reviewCount: (_a = product === null || product === void 0 ? void 0 : product.Review) === null || _a === void 0 ? void 0 : _a.length };
});
const getRecentViewProductsFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield prisma_1.default.customer.findUniqueOrThrow({
        where: { email: user === null || user === void 0 ? void 0 : user.email },
    });
    const result = yield prisma_1.default.recentView.findMany({
        where: { customerId: customer === null || customer === void 0 ? void 0 : customer.id },
        include: {
            product: {
                include: {
                    vendor: true,
                },
            },
        },
        orderBy: { viewedAt: "desc" },
        take: 10,
    });
    return result;
});
exports.ProductServices = {
    createProductInDB,
    getAllProductFromDB,
    getProductByIdFromDB,
    getRecentViewProductsFromDB,
    updateProductInDB,
    deleteProductInDB
};
