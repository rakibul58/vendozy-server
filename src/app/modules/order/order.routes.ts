import { Router } from "express";
import auth from "../../middlewares/auth";
import { OrderControllers } from "./order.controllers";
import { UserRole } from "@prisma/client";

const router = Router();

router
  .route("/initiate-payment")
  .post(auth(UserRole.CUSTOMER), OrderControllers.initiatePayment);

router.route("/verify-payment").post(OrderControllers.verifyPayment);

export const OrderRoutes = router;
