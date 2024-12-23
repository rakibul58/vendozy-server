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
exports.calculateDiscountedPrice = exports.validateCoupon = exports.verifyPayment = exports.initiatePayment = exports.generateTransactionId = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../../../config"));
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const generateTransactionId = () => {
    return "TXN-" + crypto_1.default.randomBytes(16).toString("hex");
};
exports.generateTransactionId = generateTransactionId;
const initiatePayment = (paymentData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.post(config_1.default.base_url, {
            store_id: config_1.default.store_id,
            signature_key: config_1.default.signature_key,
            tran_id: paymentData.transactionId,
            success_url: `${config_1.default.backend_url}/orders/verify-payment?transactionId=${paymentData.transactionId}&status=success&customerName=${paymentData.customerName}&orderId=${paymentData.orderId}&cartId=${paymentData.cartId}&amount=${paymentData.totalPrice}`,
            fail_url: `${config_1.default.backend_url}/orders/verify-payment?transactionId=${paymentData.transactionId}&status=failed&customerName=${paymentData.customerName}&orderId=${paymentData.orderId}&amount=${paymentData.totalPrice}`,
            cancel_url: `${config_1.default.backend_url}/orders/verify-payment?transactionId=${paymentData.transactionId}&status=cancelled&customerName=${paymentData.customerName}&orderId=${paymentData.orderId}&amount=${paymentData.totalPrice}`,
            amount: paymentData.totalPrice,
            currency: "USD",
            desc: "Order Payment",
            cus_name: paymentData.customerName,
            cus_email: paymentData.customerEmail,
            cus_add1: paymentData.customerAddress,
            cus_add2: "N/A",
            cus_city: "N/A",
            cus_state: "N/A",
            cus_postcode: "N/A",
            cus_country: "N/A",
            cus_phone: paymentData.customerPhone,
            type: "json",
        });
        return response.data;
    }
    catch (err) {
        console.log({ err });
        throw new Error("Payment initiation failed!");
    }
});
exports.initiatePayment = initiatePayment;
const verifyPayment = (tnxId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(config_1.default.base_url, {
            params: {
                store_id: config_1.default.store_id,
                signature_key: config_1.default.signature_key,
                type: "json",
                request_id: tnxId,
            },
        });
        return response.status;
    }
    catch (err) {
        throw new Error("Payment validation failed!");
    }
});
exports.verifyPayment = verifyPayment;
const validateCoupon = (couponCode, totalAmount) => __awaiter(void 0, void 0, void 0, function* () {
    const coupon = yield prisma_1.default.coupon.findUnique({
        where: {
            code: couponCode,
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
        },
    });
    if (!coupon) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid or expired coupon code");
    }
    if (coupon.minPurchase && totalAmount < Number(coupon.minPurchase)) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Minimum purchase amount of ${coupon.minPurchase} required for this coupon`);
    }
    return coupon;
});
exports.validateCoupon = validateCoupon;
const calculateDiscountedPrice = (totalPrice, discountType, discountValue) => {
    if (discountType === "PERCENTAGE") {
        return totalPrice - (totalPrice * discountValue) / 100;
    }
    return totalPrice - discountValue;
};
exports.calculateDiscountedPrice = calculateDiscountedPrice;
