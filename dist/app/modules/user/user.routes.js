"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_controllers_1 = require("./user.controllers");
const user_validations_1 = require("./user.validations");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router
    .route("/create-admin")
    .post((0, auth_1.default)(client_1.UserRole.ADMIN), (0, validateRequest_1.default)(user_validations_1.UserValidations.createAdminValidationSchema), user_controllers_1.UserControllers.createAdmin);
router
    .route("/create-vendor")
    .post((0, validateRequest_1.default)(user_validations_1.UserValidations.createVendorValidationSchema), user_controllers_1.UserControllers.createVendor);
router
    .route("/create-customer")
    .post((0, validateRequest_1.default)(user_validations_1.UserValidations.createCustomerValidationSchema), user_controllers_1.UserControllers.createCustomer);
router
    .route("/me")
    .get((0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.VENDOR, client_1.UserRole.CUSTOMER), user_controllers_1.UserControllers.getProfile);
exports.UserRoutes = router;
