"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const product_validations_1 = require("./product.validations");
const product_controllers_1 = require("./product.controllers");
const optionalAuth_1 = require("../../middlewares/optionalAuth");
const router = (0, express_1.Router)();
router
    .route("/")
    .get(optionalAuth_1.optionalAuth, product_controllers_1.ProductControllers.getAllProduct)
    .post((0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.VENDOR), (0, validateRequest_1.default)(product_validations_1.ProductValidations.createProductValidationSchema), product_controllers_1.ProductControllers.createProduct);
router
    .route("/recent-view")
    .get((0, auth_1.default)(client_1.UserRole.CUSTOMER), product_controllers_1.ProductControllers.getRecentViewProducts);
router
    .route("/:id")
    .get(optionalAuth_1.optionalAuth, product_controllers_1.ProductControllers.getProductById)
    .put((0, auth_1.default)(client_1.UserRole.VENDOR, client_1.UserRole.ADMIN), product_controllers_1.ProductControllers.updateProduct)
    .delete((0, auth_1.default)(client_1.UserRole.VENDOR, client_1.UserRole.ADMIN), product_controllers_1.ProductControllers.deleteProduct);
exports.ProductRoutes = router;
