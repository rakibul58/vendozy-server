"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoutes = void 0;
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const category_validations_1 = require("./category.validations");
const category_controllers_1 = require("./category.controllers");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router
    .route("/")
    .get(category_controllers_1.CategoryControllers.getAllCategory)
    .post((0, auth_1.default)(client_1.UserRole.ADMIN), (0, validateRequest_1.default)(category_validations_1.CategoryValidations.createCategoryValidationSchema), category_controllers_1.CategoryControllers.createCategory);
router
    .route("/categoryWithProduct")
    .get(category_controllers_1.CategoryControllers.getCategoryWithProduct);
router
    .route("/:id")
    .get(category_controllers_1.CategoryControllers.getSingleCategory)
    .put((0, auth_1.default)(client_1.UserRole.ADMIN), (0, validateRequest_1.default)(category_validations_1.CategoryValidations.updateCategoryValidationSchema), category_controllers_1.CategoryControllers.updateCategory)
    .delete((0, auth_1.default)(client_1.UserRole.ADMIN), category_controllers_1.CategoryControllers.deleteCategory);
exports.CategoryRoutes = router;
