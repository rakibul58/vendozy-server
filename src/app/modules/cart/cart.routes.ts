import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { CartControllers } from "./cart.controllers";

const router = Router();

router
  .route("/")
  .get(auth(UserRole.CUSTOMER), CartControllers.getCart)
  .post(auth(UserRole.CUSTOMER), CartControllers.addToCart)
  .delete(auth(UserRole.CUSTOMER), CartControllers.clearCart);

router
  .route("/cartItem/:cartItemId")
  .put(auth(UserRole.CUSTOMER), CartControllers.updateCartItem)
  .delete(auth(UserRole.CUSTOMER), CartControllers.removeCartItem);

export const CartRoutes = router;
