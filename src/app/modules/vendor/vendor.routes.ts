import { UserRole } from "@prisma/client";
import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { VendorValidations } from "./vendor.validations";
import { VendorControllers } from "./vendor.controllers";
import auth from "../../middlewares/auth";

const router = Router();

router
  .route("/onboarding")
  .post(
    auth(UserRole.VENDOR),
    validateRequest(VendorValidations.vendorOnboardingValidationSchema),
    VendorControllers.vendorOnboarding
  );

router
  .route("/:id/follow")
  .post(auth(UserRole.CUSTOMER), VendorControllers.followVendorShop);

router
  .route("/:id/follow-status")
  .get(auth(UserRole.CUSTOMER), VendorControllers.getFollowStatus);

router.route("/:id").get(VendorControllers.getVendorShop);

export const VendorRoutes = router;
