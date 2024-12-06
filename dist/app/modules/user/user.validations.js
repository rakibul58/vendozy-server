"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidations = void 0;
const zod_1 = require("zod");
const createAdminValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string({
            required_error: "Password is required",
        }),
        admin: zod_1.z.object({
            name: zod_1.z.string().optional(),
            email: zod_1.z.string({
                required_error: "Email is required!",
            }),
            phone: zod_1.z.string().optional(),
        }),
    }),
});
const createVendorValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string({
            required_error: "Password is required",
        }),
        vendor: zod_1.z.object({
            name: zod_1.z.string().optional(),
            email: zod_1.z.string({
                required_error: "Email is required!",
            }),
            phone: zod_1.z.string({
                required_error: "Phone numbers is required!",
            }),
            description: zod_1.z.string().optional(),
            logo: zod_1.z.string().optional(),
        }),
    }),
});
const createCustomerValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string({
            required_error: "Password is required",
        }),
        customer: zod_1.z.object({
            name: zod_1.z.string({
                required_error: "Name is required!",
            }),
            email: zod_1.z.string({
                required_error: "Email is required!",
            }),
            phone: zod_1.z.string({
                required_error: "Phone numbers is required!",
            }),
            address: zod_1.z.string({ required_error: "Address is Required!" }),
            profileImg: zod_1.z.string().optional(),
        }),
    }),
});
exports.UserValidations = {
    createAdminValidationSchema,
    createVendorValidationSchema,
    createCustomerValidationSchema,
};
