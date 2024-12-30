import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryValidations } from "./category.validations";
import { CategoryControllers } from "./category.controllers";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router
  .route("/")
  .get(CategoryControllers.getAllCategory)
  .post(
    auth(UserRole.ADMIN),
    validateRequest(CategoryValidations.createCategoryValidationSchema),
    CategoryControllers.createCategory
  );

router
  .route("/categoryWithProduct")
  .get(CategoryControllers.getCategoryWithProduct);

router
  .route("/:id")
  .get(CategoryControllers.getSingleCategory)
  .put(
    auth(UserRole.ADMIN),
    validateRequest(CategoryValidations.updateCategoryValidationSchema),
    CategoryControllers.updateCategory
  )
  .delete(auth(UserRole.ADMIN), CategoryControllers.deleteCategory);

export const CategoryRoutes = router;
