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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorServices = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const vendorOnboardingInDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const vendorUpdate = yield transactionClient.vendor.update({
            where: {
                email: user.email,
            },
            data: Object.assign(Object.assign({}, payload.vendor), { isOnboarded: true }),
        });
        yield transactionClient.product.create({
            data: payload.product,
        });
        return vendorUpdate;
    }));
    return result;
});
const getVendorShopFromDB = (vendorId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendor = yield prisma_1.default.vendor.findUniqueOrThrow({
        where: { id: vendorId },
        include: {
            user: {
                select: {
                    createdAt: true,
                },
            },
            _count: {
                select: { shopFollowers: true, products: true },
            },
        },
    });
    return Object.assign(Object.assign({}, vendor), { followerCount: vendor._count.shopFollowers, productCount: vendor._count.products, joinDate: (_a = vendor === null || vendor === void 0 ? void 0 : vendor.user) === null || _a === void 0 ? void 0 : _a.createdAt });
});
const followShopsInDB = (user, vendorId) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield prisma_1.default.customer.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    // Check if already following
    const existingFollow = yield prisma_1.default.shopFollower.findUnique({
        where: {
            customerId_vendorId: {
                customerId: customer === null || customer === void 0 ? void 0 : customer.id,
                vendorId,
            },
        },
    });
    if (existingFollow) {
        // Unfollow
        const result = yield prisma_1.default.shopFollower.delete({
            where: {
                customerId_vendorId: {
                    customerId: customer === null || customer === void 0 ? void 0 : customer.id,
                    vendorId,
                },
            },
        });
        return result;
    }
    else {
        // Follow
        const result = yield prisma_1.default.shopFollower.create({
            data: {
                customerId: customer === null || customer === void 0 ? void 0 : customer.id,
                vendorId,
            },
        });
        return result;
    }
});
const getFollowStatusFromDB = (user, vendorId) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield prisma_1.default.customer.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    const followStatus = yield prisma_1.default.shopFollower.findUnique({
        where: {
            customerId_vendorId: {
                customerId: customer === null || customer === void 0 ? void 0 : customer.id,
                vendorId,
            },
        },
    });
    return { isFollowing: !!followStatus };
});
exports.VendorServices = {
    vendorOnboardingInDB,
    getVendorShopFromDB,
    followShopsInDB,
    getFollowStatusFromDB,
};
