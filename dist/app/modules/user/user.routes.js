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
exports.UserRoutes = router;
