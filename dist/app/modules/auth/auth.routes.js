"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const auth_controllers_1 = require("./auth.controllers");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.route("/login").post(auth_controllers_1.AuthControllers.loginUser);
router.route("/refresh-token").post(auth_controllers_1.AuthControllers.refreshToken);
router
    .route("/change-password")
    .post((0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.CUSTOMER, client_1.UserRole.VENDOR), auth_controllers_1.AuthControllers.changePassword);
router.route("/forget-password").post(auth_controllers_1.AuthControllers.forgotPassword);
router.route("/reset-password").post(auth_controllers_1.AuthControllers.resetPassword);
exports.AuthRoutes = router;
