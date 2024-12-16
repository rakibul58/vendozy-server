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
const getAllProductFromDB = (filters, options, userId // Optional user ID
) => __awaiter(void 0, void 0, void 0, function* () {
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
    if (userId) {
        const customer = yield prisma_1.default.customer.findUnique({
            where: { userId },
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
    // Prepare result and total
    let result = [];
    let total = 0;
    // Construct base where conditions
    const baseWhereInput = {
        AND: andConditions,
    };
    // If user follows shops, first fetch their products
    if (followedShopIds.length > 0) {
        const followedShopWhereInput = Object.assign(Object.assign({}, baseWhereInput), { vendor: {
                id: {
                    in: followedShopIds,
                },
            } });
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
        // Count followed shop products
        const followedShopProductsCount = yield prisma_1.default.product.count({
            where: followedShopWhereInput,
        });
        // If followed shop products are less than limit, fetch remaining from other shops
        if (followedShopProducts.length < limit) {
            const remainingLimit = limit - followedShopProducts.length;
            const otherShopWhereInput = Object.assign(Object.assign({}, baseWhereInput), { vendor: {
                    id: {
                        notIn: followedShopIds,
                    },
                } });
            const otherShopProducts = yield prisma_1.default.product.findMany({
                where: otherShopWhereInput,
                skip,
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
            // Count total other shop products
            const otherShopProductsCount = yield prisma_1.default.product.count({
                where: otherShopWhereInput,
            });
            total = followedShopProductsCount + otherShopProductsCount;
        }
        else {
            result = followedShopProducts;
            total = followedShopProductsCount;
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
exports.ProductServices = {
    createProductInDB,
    getAllProductFromDB,
};
