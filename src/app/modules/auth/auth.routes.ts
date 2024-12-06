import { Router } from "express";
import { AuthControllers } from "./auth.controllers";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidations } from "../user/user.validations";

const router = Router();

router.route("/login").post(AuthControllers.loginUser);

router
  .route("/register/vendor")
  .post(
    validateRequest(UserValidations.createVendorValidationSchema),
    AuthControllers.vendorRegistration
  );

router
  .route("/register/customer")
  .post(
    validateRequest(UserValidations.createCustomerValidationSchema),
    AuthControllers.customerRegistration
  );

router.route("/refresh-token").post(AuthControllers.refreshToken);

router
  .route("/change-password")
  .post(
    auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR),
    AuthControllers.changePassword
  );
router.route("/forget-password").post(AuthControllers.forgotPassword);
router.route("/reset-password").post(AuthControllers.resetPassword);

export const AuthRoutes = router;
