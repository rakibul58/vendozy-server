import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { CouponControllers } from "./coupon.controllers";

const router = Router();

router
  .route("/")
  .get(CouponControllers.createCoupon)
  .post(auth(UserRole.ADMIN), CouponControllers.createCoupon);

router
  .route("/:id")
  .get(CouponControllers.getSingleCoupon)
  .put(auth(UserRole.ADMIN), CouponControllers.updateCoupon)
  .delete(auth(UserRole.ADMIN), CouponControllers.deleteCoupon);

export const CouponRoutes = router;
