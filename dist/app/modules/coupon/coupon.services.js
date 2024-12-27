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
exports.CouponServices = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const createCouponInDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (new Date(payload.startDate) > new Date(payload.endDate)) {
        throw new Error("Start date cannot be after end date");
    }
    const result = yield prisma_1.default.coupon.create({
        data: payload,
    });
    return result;
});
const getAllCouponFromDB = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, isActive, validNow } = filters, filterData = __rest(filters, ["searchTerm", "isActive", "validNow"]); // Extract validNow
    const andConditions = [];
    // Search term condition
    if (searchTerm) {
        andConditions.push({
            OR: ["code", "description"].map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    // Active status condition
    if (isActive !== undefined) {
        andConditions.push({
            isActive: isActive === "true", // Simplified boolean conversion
        });
    }
    // Valid date range condition
    if (validNow === "true") {
        const currentDate = new Date();
        andConditions.push({
            startDate: {
                lte: currentDate,
            },
            endDate: {
                gte: currentDate,
            },
        });
    }
    // Dynamic filters
    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.entries(filterData).map(([key, value]) => ({
            [key]: {
                equals: value,
            },
        }));
        andConditions.push(...filterConditions);
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const [result, total] = yield Promise.all([
        prisma_1.default.coupon.findMany({
            where: whereConditions,
            skip,
            take: limit,
            orderBy: options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : { createdAt: "desc" },
        }),
        prisma_1.default.coupon.count({
            where: whereConditions,
        }),
    ]);
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
});
const getCouponByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.coupon.findUniqueOrThrow({
        where: {
            id,
        },
    });
    return result;
});
const updateCouponInDB = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (data.startDate && data.endDate) {
        if (new Date(data.startDate) > new Date(data.endDate)) {
            throw new Error("Start date cannot be after end date");
        }
    }
    yield prisma_1.default.coupon.findUniqueOrThrow({
        where: {
            id,
        },
    });
    const result = yield prisma_1.default.coupon.update({
        where: {
            id,
        },
        data,
    });
    return result;
});
const deleteCouponFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.coupon.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
    });
    return result;
});
exports.CouponServices = {
    createCouponInDB,
    getAllCouponFromDB,
    getCouponByIdFromDB,
    updateCouponInDB,
    deleteCouponFromDB,
};
