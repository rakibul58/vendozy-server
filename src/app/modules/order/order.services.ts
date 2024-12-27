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
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";

const initiateCheckoutInDB = async (
  user: JwtPayload,
  input: CheckoutInput & { productId?: string; quantity?: number }
) => {
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { email: user?.email },
  });

  let items;
  let cartId = null;

  // Handle single product checkout
  if (input.productId && input.quantity) {
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: input.productId },
    });

    // Validate inventory for single product
    if (input.quantity > product.inventoryCount) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Insufficient inventory for product: ${product.name}`
      );
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

    // Validate inventory for cart items
    for (const item of cart.items) {
      if (item.quantity > item.product.inventoryCount) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `Insufficient inventory for product: ${item.product.name}`
        );
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

  // Create order using transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
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
  });

  // Prepare payment data
  const paymentData: PaymentData = {
    transactionId,
    totalPrice,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    customerAddress: customer.address,
    orderId: order.id,
    couponCode: finalCouponCode as string,
    discountAmount,
    cartId, // Will be null for single product checkout
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

        // Update product inventory
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

        // Clear cart only if cartId is provided (cart checkout)
        if (query.cartId != "null") {
          await tx.cartItem.deleteMany({
            where: { cartId: query.cartId },
          });

          await tx.cart.delete({
            where: { id: query.cartId },
          });
        }

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

const getCustomerOrdersFromDB = async (
  user: JwtPayload,
  options: IPaginationOptions
) => {
  const customer = await prisma.customer.findFirstOrThrow({
    where: {
      email: user?.email,
    },
  });
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  const [orders, total] = await prisma.$transaction([
    prisma.orderItem.findMany({
      where: {
        order: {
          customerId: customer?.id,
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
                customerId: customer?.id,
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
        order: {createdAt: 'desc'}
      },
    }),
    prisma.orderItem.count({
      where: {
        order: {
          customerId: customer?.id,
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
};

export const OrderServices = {
  initiateCheckoutInDB,
  verifyCheckoutInDB,
  getCustomerOrdersFromDB,
};
