import { z } from "zod";

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Category name is required!" }),
    description: z.string().optional(),
    image: z.string(),
  }),
});

const updateCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const CategoryValidations = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema
};
