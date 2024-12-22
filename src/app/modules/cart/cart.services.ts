import { Decimal } from "@prisma/client/runtime/library";
import prisma from "../../../shared/prisma";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";

interface CartItem {
  productId: string;
  quantity: number;
  price: Decimal;
  product: {
    name: string;
    images: string[];
    inventoryCount: number;
    discount: Decimal | null;
  };
}

const getTransformedCart = async (customerId: string) => {
  const cart = await prisma.cart.findFirst({
    where: { customerId },
    include: {
      vendor: {
        select: {
          name: true,
          logo: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
              images: true,
              inventoryCount: true,
              discount: true,
            },
          },
        },
      },
    },
  });

  if (!cart) return { cart: [], total: new Decimal(0) };

  const total = cart.items.reduce((acc, item) => {
    const discountedPrice = item.product.discount
      ? item.price.sub(item.price.mul(item.product.discount.div(100)))
      : item.price;
    return acc.add(discountedPrice.mul(item.quantity));
  }, new Decimal(0));

  return {
    ...cart,
    total,
  };
};

const addToCartInDB = async (
  user: JwtPayload,
  payload: {
    productId: string;
    quantity: number;
    vendorId: string;
  }
) => {
  const { productId, quantity, vendorId } = payload;
  return prisma.$transaction(
    async (tx) => {
      const [customer, product] = await Promise.all([
        tx.customer.findUniqueOrThrow({
          where: { email: user.email },
        }),
        tx.product.findUniqueOrThrow({
          where: { id: productId, isDeleted: false },
          select: {
            price: true,
            inventoryCount: true,
          },
        }),
      ]);

      if (product.inventoryCount < quantity) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "Requested quantity exceeds available inventory"
        );
      }

      // Find any existing cart for this customer
      const existingCart = await tx.cart.findFirst({
        where: { customerId: customer.id },
        include: { items: true },
      });

      // Handle vendor conflict by deleting old cart and its items
      if (existingCart && existingCart.vendorId !== vendorId) {
        // First delete all cart items
        await tx.cartItem.deleteMany({
          where: { cartId: existingCart.id },
        });
        // Then delete the cart
        await tx.cart.delete({
          where: { id: existingCart.id },
        });
      }

      // Create or find cart for current vendor
      let cart = await tx.cart.upsert({
        where: {
          customerId_vendorId: {
            customerId: customer.id,
            vendorId,
          },
        },
        create: {
          customerId: customer.id,
          vendorId,
        },
        update: {},
        include: { items: true },
      });

      // Handle cart item
      const existingItem = cart.items.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.inventoryCount) {
          throw new AppError(
            StatusCodes.BAD_REQUEST,
            "Requested quantity exceeds available inventory"
          );
        }
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
            price: product.price,
          },
        });
      }

      return getTransformedCart(customer.id);
    },
    {
      maxWait: 5000,
      timeout: 10000,
    }
  );
};

// Update cart item quantity
const updateCartItemInDB = async (
  user: JwtPayload,
  cartItemId: string,
  quantity: number
) => {
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { email: user.email },
  });

  const cartItem = await prisma.cartItem.findUniqueOrThrow({
    where: { id: cartItemId, cart: { customerId: customer.id } },
    include: {
      cart: {
        select: {
          customerId: true,
        },
      },
      product: {
        select: {
          inventoryCount: true,
        },
      },
    },
  });

  // Validate quantity
  if (quantity > cartItem.product.inventoryCount) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Requested quantity exceeds available inventory"
    );
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  } else {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  return getTransformedCart(customer.id);
};

// Remove item from cart
const removeFromCartInDB = async (user: JwtPayload, cartItemId: string) => {
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { email: user.email },
  });

  const cartItem = await prisma.cartItem.findUniqueOrThrow({
    where: { id: cartItemId, cart: { customerId: customer.id } },
    include: {
      cart: {
        select: {
          customerId: true,
        },
      },
    },
  });

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  return getTransformedCart(customer.id);
};

// Get cart
const getCartInDB = async (user: JwtPayload) => {
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { email: user.email },
  });

  return getTransformedCart(customer.id);
};

// Clear cart
const clearCartInDB = async (user: JwtPayload) => {
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { email: user.email },
  });

  const cart = await prisma.cart.findFirst({
    where: { customerId: customer.id },
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    await prisma.cart.delete({
      where: { id: cart.id },
    });
  }

  return;
};

export const CartServices = {
  addToCartInDB,
  updateCartItemInDB,
  clearCartInDB,
  getCartInDB,
  removeFromCartInDB,
};
