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
  .route("/newsletter/subscribe")
  .post(UserControllers.subscribeToNewsletter);

router
  .route("/newsletters")
  .get(auth(UserRole.ADMIN), UserControllers.getAllNewsLetter);

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

router
  .route("/toggle-customer-status")
  .put(auth(UserRole.ADMIN), UserControllers.toggleCustomerStatus);

router
  .route("/toggle-vendor-status")
  .put(auth(UserRole.ADMIN), UserControllers.toggleVendorStatus);

router
  .route("/customer/dashboard")
  .get(auth(UserRole.CUSTOMER), UserControllers.getCustomerDashboard);

router
  .route("/vendor/dashboard")
  .get(auth(UserRole.VENDOR), UserControllers.getVendorDashboard);

router
  .route("/admin/dashboard")
  .get(auth(UserRole.ADMIN), UserControllers.getAdminDashboard);

router
  .route("/customer/:userId")
  .get(auth(UserRole.ADMIN), UserControllers.getAllCustomers);

router.route("/vendor/:userId").get(UserControllers.getAllVendors);

export const UserRoutes = router;
