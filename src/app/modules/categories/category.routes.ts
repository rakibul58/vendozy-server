import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryValidations } from "./category.validations";
import { CategoryControllers } from "./category.controllers";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router
  .route("/")
  .post(
    auth(UserRole.ADMIN),
    validateRequest(CategoryValidations.createCategoryValidationSchema),
    CategoryControllers.createCategory
  );

export const CategoryRoutes = router;
