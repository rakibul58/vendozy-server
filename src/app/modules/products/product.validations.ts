import { z } from "zod";

const createProductValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Product name is required!" }),
    description: z.string({ required_error: "Description is required!" }),
    price: z
      .number({ required_error: "Price is required!" })
      .min(0, "Price must be a positive number"),
    categoryId: z.string().nullable().optional(),
    vendorId: z.string({ required_error: "Vendor ID is required!" }),
    images: z.array(z.string()).min(1, "At least one image URL is required"),
    inventoryCount: z
      .number({ required_error: "Inventory count is required!" })
      .min(0, "Inventory count must be a non-negative number"),
    discount: z.number().min(0).max(99.99).nullable().optional(),
    isFlashSale: z.boolean().optional(),
    averageRating: z.number().min(0).max(5).optional(),
  }),
});

const updateProductValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    categoryId: z.string().nullable().optional(),
    vendorId: z.string().optional(),
    images: z.array(z.string()).optional(),
    inventoryCount: z.number().min(0).optional(),
    discount: z.number().min(0).max(99.99).nullable().optional(),
    isFlashSale: z.boolean().optional(),
    averageRating: z.number().min(0).max(5).optional(),
    isDeleted: z.boolean().optional(),
  }),
});

export const ProductValidations = {
  createProductValidationSchema,
  updateProductValidationSchema,
};
