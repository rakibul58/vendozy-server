"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductValidations = void 0;
const zod_1 = require("zod");
const createProductValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: "Product name is required!" }),
        description: zod_1.z.string({ required_error: "Description is required!" }),
        price: zod_1.z
            .number({ required_error: "Price is required!" })
            .min(0, "Price must be a positive number"),
        categoryId: zod_1.z.string().nullable().optional(),
        vendorId: zod_1.z.string({ required_error: "Vendor ID is required!" }),
        images: zod_1.z.array(zod_1.z.string()).min(1, "At least one image URL is required"),
        inventoryCount: zod_1.z
            .number({ required_error: "Inventory count is required!" })
            .min(0, "Inventory count must be a non-negative number"),
        discount: zod_1.z.number().min(0).max(99.99).nullable().optional(),
        isFlashSale: zod_1.z.boolean().optional(),
        averageRating: zod_1.z.number().min(0).max(5).optional(),
    }),
});
const updateProductValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        price: zod_1.z.number().min(0).optional(),
        categoryId: zod_1.z.string().nullable().optional(),
        vendorId: zod_1.z.string().optional(),
        images: zod_1.z.array(zod_1.z.string()).optional(),
        inventoryCount: zod_1.z.number().min(0).optional(),
        discount: zod_1.z.number().min(0).max(99.99).nullable().optional(),
        isFlashSale: zod_1.z.boolean().optional(),
        averageRating: zod_1.z.number().min(0).max(5).optional(),
        isDeleted: zod_1.z.boolean().optional(),
    }),
});
exports.ProductValidations = {
    createProductValidationSchema,
    updateProductValidationSchema,
};
