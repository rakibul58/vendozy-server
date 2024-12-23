import axios from "axios";
import crypto from "crypto";
import config from "../../../config";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import prisma from "../../../shared/prisma";

export const generateTransactionId = () => {
  return "TXN-" + crypto.randomBytes(16).toString("hex");
};

export const initiatePayment = async (paymentData: any) => {
  try {
    const response = await axios.post(config.base_url!, {
      store_id: config.store_id,
      signature_key: config.signature_key,
      tran_id: paymentData.transactionId,
      success_url: `${config.backend_url}/orders/verify-payment?transactionId=${paymentData.transactionId}&status=success&customerName=${paymentData.customerName}&orderId=${paymentData.orderId}&cartId=${paymentData.cartId}&amount=${paymentData.totalPrice}`,
      fail_url: `${config.backend_url}/orders/verify-payment?transactionId=${paymentData.transactionId}&status=failed&customerName=${paymentData.customerName}&orderId=${paymentData.orderId}&amount=${paymentData.totalPrice}`,
      cancel_url: `${config.backend_url}/orders/verify-payment?transactionId=${paymentData.transactionId}&status=cancelled&customerName=${paymentData.customerName}&orderId=${paymentData.orderId}&amount=${paymentData.totalPrice}`,
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
  } catch (err) {
    console.log({err});
    throw new Error("Payment initiation failed!");
  }
};

export const verifyPayment = async (tnxId: string) => {
  try {
    const response = await axios.get(config.base_url!, {
      params: {
        store_id: config.store_id,
        signature_key: config.signature_key,
        type: "json",
        request_id: tnxId,
      },
    });
    return response.status;
  } catch (err) {
    throw new Error("Payment validation failed!");
  }
};

export const validateCoupon = async (
  couponCode: string,
  totalAmount: number
) => {
  const coupon = await prisma.coupon.findUnique({
    where: {
      code: couponCode,
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
  });

  if (!coupon) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid or expired coupon code"
    );
  }

  if (coupon.minPurchase && totalAmount < Number(coupon.minPurchase)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Minimum purchase amount of ${coupon.minPurchase} required for this coupon`
    );
  }

  return coupon;
};

export const calculateDiscountedPrice = (
  totalPrice: number,
  discountType: "PERCENTAGE" | "FIXED_AMOUNT",
  discountValue: number
) => {
  if (discountType === "PERCENTAGE") {
    return totalPrice - (totalPrice * discountValue) / 100;
  }
  return totalPrice - discountValue;
};



