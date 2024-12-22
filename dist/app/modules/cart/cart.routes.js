"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const cart_controllers_1 = require("./cart.controllers");
const router = (0, express_1.Router)();
router
    .route("/")
    .get((0, auth_1.default)(client_1.UserRole.CUSTOMER), cart_controllers_1.CartControllers.getCart)
    .post((0, auth_1.default)(client_1.UserRole.CUSTOMER), cart_controllers_1.CartControllers.addToCart)
    .delete((0, auth_1.default)(client_1.UserRole.CUSTOMER), cart_controllers_1.CartControllers.clearCart);
router
    .route("/cartItem/:cartItemId")
    .put((0, auth_1.default)(client_1.UserRole.CUSTOMER), cart_controllers_1.CartControllers.updateCartItem)
    .delete((0, auth_1.default)(client_1.UserRole.CUSTOMER), cart_controllers_1.CartControllers.removeCartItem);
exports.CartRoutes = router;
