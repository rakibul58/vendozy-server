import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import {
  calculateDiscountedPrice,
  generateTransactionId,
  initiatePayment,
  validateCoupon,
  verifyPayment,
} from "./order.utils";
import { join } from "path";
import { readFileSync } from "fs";
import {
  CheckoutInput,
  PaymentData,
  VerifyCheckoutQuery,
} from "./order.interface";

const initiateCheckoutInDB = async (user: JwtPayload, input: CheckoutInput) => {
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { email: user?.email },
  });
  // Find cart with all necessary relations
  const cart = await prisma.cart.findFirst({
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
    throw new AppError(StatusCodes.NOT_FOUND, "Cart is empty");
  }

  // Validate product inventory
  for (const item of cart.items) {
    if (item.quantity > item.product.inventoryCount) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Insufficient inventory for product: ${item.product.name}`
      );
    }
  }

  // Calculate initial total price
  let totalPrice = cart.items.reduce((sum, item) => {
    const price = Number(item.price);
    const discount = Number(item.product.discount || 0);
    const discountedPrice = price - (price * discount) / 100;
    return sum + discountedPrice * item.quantity;
  }, 0);

  // Handle coupon if provided
  let discountAmount = 0;
  let finalCouponCode = null;

  if (input.couponCode) {
    const coupon = await validateCoupon(input.couponCode, totalPrice);
    const discountedTotal = calculateDiscountedPrice(
      totalPrice,
      coupon.discountType,
      Number(coupon.discountValue)
    );
    discountAmount = totalPrice - discountedTotal;
    totalPrice = discountedTotal;
    finalCouponCode = coupon.code;
  }

  const transactionId = generateTransactionId();

  // Create order using transaction to ensure data consistency
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        customerId: cart.customerId,
        vendorId: cart.vendorId,
        totalAmount: totalPrice,
        status: "PENDING",
        couponCode: finalCouponCode,
        orderItems: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            discount: item.product.discount,
          })),
        },
      },
    });

    return newOrder;
  });

  // Prepare payment data
  const paymentData: PaymentData = {
    transactionId,
    totalPrice,
    customerName: cart.customer.name,
    customerEmail: cart.customer.email,
    customerPhone: cart.customer.phone,
    customerAddress: cart.customer.address,
    orderId: order.id,
    couponCode: finalCouponCode as string,
    discountAmount,
    cartId: cart.id,
  };

  // Initiate payment
  const paymentSession = await initiatePayment(paymentData);
  return paymentSession;
};

const verifyCheckoutInDB = async (query: VerifyCheckoutQuery) => {
  return await prisma.$transaction(
    async (tx) => {
      const verifyResponse = await verifyPayment(query.transactionId);
      let filePath;

      // Handle successful payment
      if (verifyResponse === 200 && query.status === "success") {
        // Update order status
        const order = await tx.order.update({
          where: { id: query.orderId },
          data: { status: "PAID" },
          include: {
            orderItems: true,
          },
        });

        // Update product inventory for each item
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              inventoryCount: {
                decrement: item.quantity,
              },
            },
          });
        }

        // First delete all cart items
        await tx.cartItem.deleteMany({
          where: { cartId: query.cartId },
        });

        // Then delete the cart
        await tx.cart.delete({
          where: { id: query.cartId },
        });

        filePath = join(__dirname, "../../views/checkout-success.html");
      } else {
        // Handle failed payment
        await tx.order.update({
          where: { id: query.orderId },
          data: { status: "CANCELLED" },
        });
        filePath = join(__dirname, "../../views/checkout-success.html");
      }

      // Prepare response template
      let template = readFileSync(filePath, "utf-8");
      template = template
        .replace("{{transactionId}}", query.transactionId)
        .replace("{{name}}", query.customerName)
        .replace("{{amount}}", query.amount);

      return template;
    },
    {
      maxWait: 10000,
      timeout: 30000,
    }
  );
};

export const OrderServices = {
  initiateCheckoutInDB,
  verifyCheckoutInDB,
};
