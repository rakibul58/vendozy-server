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
            name: zod_1.z.string({
                required_error: "Name is required!",
            }),
            email: zod_1.z.string({
                required_error: "Email is required!",
            }),
            phone: zod_1.z.string({
                required_error: "Phone numbers is required!",
            }),
        }),
    }),
});
exports.UserValidations = {
    createAdminValidationSchema,
};
