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

export const VendorRoutes = router;
