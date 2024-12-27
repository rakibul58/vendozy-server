import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserControllers } from "./user.controllers";
import { UserValidations } from "./user.validations";
import validateRequest from "../../middlewares/validateRequest";
import { UserRole } from "@prisma/client";

const router = Router();

router
  .route("/create-admin")
  .post(
    auth(UserRole.ADMIN),
    validateRequest(UserValidations.createAdminValidationSchema),
    UserControllers.createAdmin
  );

router
  .route("/create-vendor")
  .post(
    auth(UserRole.ADMIN),
    validateRequest(UserValidations.createVendorValidationSchema),
    UserControllers.createVendor
  );

router
  .route("/create-customer")
  .post(
    auth(UserRole.ADMIN),
    validateRequest(UserValidations.createCustomerValidationSchema),
    UserControllers.createCustomer
  );

router
  .route("/me")
  .get(
    auth(UserRole.ADMIN, UserRole.VENDOR, UserRole.CUSTOMER),
    UserControllers.getProfile
  );

router
  .route("/update-admin")
  .put(auth(UserRole.ADMIN), UserControllers.updateAdminProfile);

router
  .route("/update-vendor")
  .put(
    auth(UserRole.VENDOR, UserRole.ADMIN),
    UserControllers.updateVendorProfile
  );
router
  .route("/update-customer")
  .put(
    auth(UserRole.CUSTOMER, UserRole.ADMIN),
    UserControllers.updateCustomerProfile
  );

export const UserRoutes = router;
