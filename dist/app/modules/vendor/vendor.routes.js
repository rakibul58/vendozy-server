"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorRoutes = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const vendor_validations_1 = require("./vendor.validations");
const vendor_controllers_1 = require("./vendor.controllers");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = (0, express_1.Router)();
router
    .route("/onboarding")
    .post((0, auth_1.default)(client_1.UserRole.VENDOR), (0, validateRequest_1.default)(vendor_validations_1.VendorValidations.vendorOnboardingValidationSchema), vendor_controllers_1.VendorControllers.vendorOnboarding);
router
    .route("/:id/follow")
    .post((0, auth_1.default)(client_1.UserRole.CUSTOMER), vendor_controllers_1.VendorControllers.followVendorShop);
router
    .route("/:id/follow-status")
    .get((0, auth_1.default)(client_1.UserRole.CUSTOMER), vendor_controllers_1.VendorControllers.getFollowStatus);
router.route("/:id").get(vendor_controllers_1.VendorControllers.getVendorShop);
exports.VendorRoutes = router;
