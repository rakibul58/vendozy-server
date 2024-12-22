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
exports.CartServices = void 0;
const library_1 = require("@prisma/client/runtime/library");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_codes_1 = require("http-status-codes");
const getTransformedCart = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const cart = yield prisma_1.default.cart.findFirst({
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
    if (!cart)
        return { cart: [], total: new library_1.Decimal(0) };
    const total = cart.items.reduce((acc, item) => {
        const discountedPrice = item.product.discount
            ? item.price.sub(item.price.mul(item.product.discount.div(100)))
            : item.price;
        return acc.add(discountedPrice.mul(item.quantity));
    }, new library_1.Decimal(0));
    return Object.assign(Object.assign({}, cart), { total });
});
const addToCartInDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, quantity, vendorId } = payload;
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const [customer, product] = yield Promise.all([
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
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Requested quantity exceeds available inventory");
        }
        // Find any existing cart for this customer
        const existingCart = yield tx.cart.findFirst({
            where: { customerId: customer.id },
            include: { items: true },
        });
        // Handle vendor conflict by deleting old cart and its items
        if (existingCart && existingCart.vendorId !== vendorId) {
            // First delete all cart items
            yield tx.cartItem.deleteMany({
                where: { cartId: existingCart.id },
            });
            // Then delete the cart
            yield tx.cart.delete({
                where: { id: existingCart.id },
            });
        }
        // Create or find cart for current vendor
        let cart = yield tx.cart.upsert({
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
        const existingItem = cart.items.find((item) => item.productId === productId);
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.inventoryCount) {
                throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Requested quantity exceeds available inventory");
            }
            yield tx.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
            });
        }
        else {
            yield tx.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                    price: product.price,
                },
            });
        }
        return getTransformedCart(customer.id);
    }), {
        maxWait: 5000,
        timeout: 10000,
    });
});
// Update cart item quantity
const updateCartItemInDB = (user, cartItemId, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield prisma_1.default.customer.findUniqueOrThrow({
        where: { email: user.email },
    });
    const cartItem = yield prisma_1.default.cartItem.findUniqueOrThrow({
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
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Requested quantity exceeds available inventory");
    }
    if (quantity <= 0) {
        yield prisma_1.default.cartItem.delete({
            where: { id: cartItemId },
        });
    }
    else {
        yield prisma_1.default.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
        });
    }
    return getTransformedCart(customer.id);
});
// Remove item from cart
const removeFromCartInDB = (user, cartItemId) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield prisma_1.default.customer.findUniqueOrThrow({
        where: { email: user.email },
    });
    const cartItem = yield prisma_1.default.cartItem.findUniqueOrThrow({
        where: { id: cartItemId, cart: { customerId: customer.id } },
        include: {
            cart: {
                select: {
                    customerId: true,
                },
            },
        },
    });
    yield prisma_1.default.cartItem.delete({
        where: { id: cartItemId },
    });
    return getTransformedCart(customer.id);
});
// Get cart
const getCartInDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield prisma_1.default.customer.findUniqueOrThrow({
        where: { email: user.email },
    });
    return getTransformedCart(customer.id);
});
// Clear cart
const clearCartInDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield prisma_1.default.customer.findUniqueOrThrow({
        where: { email: user.email },
    });
    const cart = yield prisma_1.default.cart.findFirst({
        where: { customerId: customer.id },
    });
    if (cart) {
        yield prisma_1.default.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
        yield prisma_1.default.cart.delete({
            where: { id: cart.id },
        });
    }
    return;
});
exports.CartServices = {
    addToCartInDB,
    updateCartItemInDB,
    clearCartInDB,
    getCartInDB,
    removeFromCartInDB,
};
