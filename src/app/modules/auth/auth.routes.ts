import { Router } from "express";
import { AuthControllers } from "./auth.controllers";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.route("/login").post(AuthControllers.loginUser);
router.route("/refresh-token").post(AuthControllers.refreshToken);
router
  .route("/change-password")
  .post(
    auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR),
    AuthControllers.changePassword
  );
router.route("/forget-password").post(AuthControllers.forgotPassword);

export const AuthRoutes = router;
