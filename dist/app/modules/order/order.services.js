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
exports.OrderServices = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_codes_1 = require("http-status-codes");
const order_utils_1 = require("./order.utils");
const path_1 = require("path");
const fs_1 = require("fs");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const initiateCheckoutInDB = (user, input) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield prisma_1.default.customer.findUniqueOrThrow({
        where: { email: user === null || user === void 0 ? void 0 : user.email },
    });
    let items;
    let cartId = null;
    // Handle single product checkout
    if (input.productId && input.quantity) {
        const product = yield prisma_1.default.product.findUniqueOrThrow({
            where: { id: input.productId },
        });
        // Validate inventory for single product
        if (input.quantity > product.inventoryCount) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Insufficient inventory for product: ${product.name}`);
        }
        items = [
            {
                product,
                quantity: input.quantity,
                price: product.price,
            },
        ];
    }
    // Handle cart checkout
    else {
        const cart = yield prisma_1.default.cart.findFirst({
            where: {
                customerId: customer.id,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                customer: true,
                vendor: true,
            },
        });
        if (!cart || cart.items.length === 0) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Cart is empty");
        }
        // Validate inventory for cart items
        for (const item of cart.items) {
            if (item.quantity > item.product.inventoryCount) {
                throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Insufficient inventory for product: ${item.product.name}`);
            }
        }
        items = cart.items;
        cartId = cart.id;
    }
    // Calculate initial total price
    let totalPrice = items.reduce((sum, item) => {
        const price = Number(item.price);
        const discount = Number(item.product.discount || 0);
        const discountedPrice = price - (price * discount) / 100;
        return sum + discountedPrice * item.quantity;
    }, 0);
    // Handle coupon if provided
    let discountAmount = 0;
    let finalCouponCode = null;
    if (input.couponCode) {
        const coupon = yield (0, order_utils_1.validateCoupon)(input.couponCode, totalPrice);
        const discountedTotal = (0, order_utils_1.calculateDiscountedPrice)(totalPrice, coupon.discountType, Number(coupon.discountValue));
        discountAmount = totalPrice - discountedTotal;
        totalPrice = discountedTotal;
        finalCouponCode = coupon.code;
    }
    const transactionId = (0, order_utils_1.generateTransactionId)();
    // Create order using transaction
    const order = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const newOrder = yield tx.order.create({
            data: {
                customerId: customer.id,
                vendorId: items[0].product.vendorId,
                totalAmount: totalPrice,
                status: "PENDING",
                couponCode: finalCouponCode,
                orderItems: {
                    create: items.map((item) => ({
                        productId: item.product.id,
                        quantity: item.quantity,
                        price: item.price,
                        discount: item.product.discount,
                    })),
                },
            },
        });
        return newOrder;
    }));
    // Prepare payment data
    const paymentData = {
        transactionId,
        totalPrice,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        orderId: order.id,
        couponCode: finalCouponCode,
        discountAmount,
        cartId, // Will be null for single product checkout
    };
    // Initiate payment
    const paymentSession = yield (0, order_utils_1.initiatePayment)(paymentData);
    return paymentSession;
});
const verifyCheckoutInDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const verifyResponse = yield (0, order_utils_1.verifyPayment)(query.transactionId);
        let filePath;
        // Handle successful payment
        if (verifyResponse === 200 && query.status === "success") {
            // Update order status
            const order = yield tx.order.update({
                where: { id: query.orderId },
                data: { status: "PAID" },
                include: {
                    orderItems: true,
                },
            });
            // Update product inventory
            for (const item of order.orderItems) {
                yield tx.product.update({
                    where: { id: item.productId },
                    data: {
                        inventoryCount: {
                            decrement: item.quantity,
                        },
                    },
                });
            }
            // Clear cart only if cartId is provided (cart checkout)
            if (query.cartId != "null") {
                yield tx.cartItem.deleteMany({
                    where: { cartId: query.cartId },
                });
                yield tx.cart.delete({
                    where: { id: query.cartId },
                });
            }
            filePath = (0, path_1.join)(__dirname, "../../views/checkout-success.html");
        }
        else {
            // Handle failed payment
            yield tx.order.update({
                where: { id: query.orderId },
                data: { status: "CANCELLED" },
            });
            filePath = (0, path_1.join)(__dirname, "../../views/checkout-success.html");
        }
        // Prepare response template
        let template = (0, fs_1.readFileSync)(filePath, "utf-8");
        template = template
            .replace("{{transactionId}}", query.transactionId)
            .replace("{{name}}", query.customerName)
            .replace("{{amount}}", query.amount);
        return template;
    }), {
        maxWait: 10000,
        timeout: 30000,
    });
});
const getCustomerOrdersFromDB = (user, options) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield prisma_1.default.customer.findFirstOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const [orders, total] = yield prisma_1.default.$transaction([
        prisma_1.default.orderItem.findMany({
            where: {
                order: {
                    customerId: customer === null || customer === void 0 ? void 0 : customer.id,
                },
            },
            skip,
            take: limit,
            select: {
                id: true,
                quantity: true,
                price: true,
                order: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                        vendor: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                            },
                        },
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        images: true,
                        averageRating: true,
                        Review: {
                            where: {
                                customerId: customer === null || customer === void 0 ? void 0 : customer.id,
                            },
                            select: {
                                id: true,
                                rating: true,
                                comment: true,
                                createdAt: true,
                                replies: {
                                    select: {
                                        id: true,
                                        comment: true,
                                        createdAt: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                order: { createdAt: 'desc' }
            },
        }),
        prisma_1.default.orderItem.count({
            where: {
                order: {
                    customerId: customer === null || customer === void 0 ? void 0 : customer.id,
                },
            },
        }),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: orders,
    };
});
exports.OrderServices = {
    initiateCheckoutInDB,
    verifyCheckoutInDB,
    getCustomerOrdersFromDB,
};
