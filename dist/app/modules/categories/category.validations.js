"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryValidations = void 0;
const zod_1 = require("zod");
const createCategoryValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: "Category name is required!" }),
        description: zod_1.z.string().optional(),
        image: zod_1.z.string(),
    }),
});
const updateCategoryValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        image: zod_1.z.string().optional(),
    }),
});
exports.CategoryValidations = {
    createCategoryValidationSchema,
    updateCategoryValidationSchema
};
