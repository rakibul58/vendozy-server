"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const coupon_controllers_1 = require("./coupon.controllers");
const router = (0, express_1.Router)();
router
    .route("/")
    .get(coupon_controllers_1.CouponControllers.getAllCoupon)
    .post((0, auth_1.default)(client_1.UserRole.ADMIN), coupon_controllers_1.CouponControllers.createCoupon);
router
    .route("/:id")
    .get(coupon_controllers_1.CouponControllers.getSingleCoupon)
    .put((0, auth_1.default)(client_1.UserRole.ADMIN), coupon_controllers_1.CouponControllers.updateCoupon)
    .delete((0, auth_1.default)(client_1.UserRole.ADMIN), coupon_controllers_1.CouponControllers.deleteCoupon);
exports.CouponRoutes = router;
