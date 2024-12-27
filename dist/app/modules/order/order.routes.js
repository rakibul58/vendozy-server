"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const order_controllers_1 = require("./order.controllers");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router
    .route("/initiate-payment")
    .post((0, auth_1.default)(client_1.UserRole.CUSTOMER), order_controllers_1.OrderControllers.initiatePayment);
router.route("/verify-payment").post(order_controllers_1.OrderControllers.verifyPayment);
router
    .route("/customer-orders")
    .get((0, auth_1.default)(client_1.UserRole.CUSTOMER), order_controllers_1.OrderControllers.getCustomerOrders);
exports.OrderRoutes = router;
