import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { ProductValidations } from "./product.validations";
import { ProductControllers } from "./product.controllers";
import { optionalAuth } from "../../middlewares/optionalAuth";

const router = Router();

router
  .route("/")
  .get(optionalAuth, ProductControllers.getAllProduct)
  .post(
    auth(UserRole.ADMIN, UserRole.VENDOR),
    validateRequest(ProductValidations.createProductValidationSchema),
    ProductControllers.createProduct
  );

router
  .route("/recent-view")
  .get(auth(UserRole.CUSTOMER), ProductControllers.getRecentViewProducts);

router
  .route("/:id")
  .get(optionalAuth, ProductControllers.getProductById)
  .put(
    auth(UserRole.VENDOR, UserRole.ADMIN),
    ProductControllers.updateProduct
  )
  .delete(auth(UserRole.VENDOR, UserRole.ADMIN), ProductControllers.deleteProduct);

export const ProductRoutes = router;
