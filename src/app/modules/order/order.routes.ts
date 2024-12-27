import { Router } from "express";
import auth from "../../middlewares/auth";
import { OrderControllers } from "./order.controllers";
import { UserRole } from "@prisma/client";

const router = Router();

router
  .route("/initiate-payment")
  .post(auth(UserRole.CUSTOMER), OrderControllers.initiatePayment);

router.route("/verify-payment").post(OrderControllers.verifyPayment);

router
  .route("/customer-orders")
  .get(auth(UserRole.CUSTOMER), OrderControllers.getCustomerOrders);

router
  .route("/vendor-orders")
  .get(auth(UserRole.VENDOR), OrderControllers.getVendorOrders);

router
  .route("/admin-orders")
  .get(auth(UserRole.ADMIN), OrderControllers.getAdminOrders);

router
  .route("/add-review")
  .post(auth(UserRole.CUSTOMER), OrderControllers.addReview);

router
  .route("/add-reply")
  .post(auth(UserRole.VENDOR), OrderControllers.addReply);

router
  .route("/vendor-reviews")
  .get(auth(UserRole.VENDOR), OrderControllers.getVendorReviews);

router
  .route("/admin-reviews")
  .get(auth(UserRole.ADMIN), OrderControllers.getAdminReviews);

export const OrderRoutes = router;
