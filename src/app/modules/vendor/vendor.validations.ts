import { z } from "zod";

const vendorOnboardingValidationSchema = z.object({
  body: z.object({
    vendor: z.object({
      name: z.string().min(2, "Shop name must be at least 2 characters"),
      logo: z.string().optional(),
      description: z.string().optional(),
    }),
    product: z.object({
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
  }),
});

export const VendorValidations = {
  vendorOnboardingValidationSchema,
};
