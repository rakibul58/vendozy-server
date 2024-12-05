import { z } from "zod";

const createAdminValidationSchema = z.object({
  body: z.object({
    password: z.string({
      required_error: "Password is required",
    }),
    admin: z.object({
      name: z.string().optional(),
      email: z.string({
        required_error: "Email is required!",
      }),
      phone: z.string().optional(),
    }),
  }),
});

const createVendorValidationSchema = z.object({
  body: z.object({
    password: z.string({
      required_error: "Password is required",
    }),
    vendor: z.object({
      name: z.string({
        required_error: "Name is required!",
      }),
      email: z.string().optional(),
      phone: z.string({
        required_error: "Phone numbers is required!",
      }),
      description: z.string().optional(),
      logo: z.string().optional(),
    }),
  }),
});

const createCustomerValidationSchema = z.object({
  body: z.object({
    password: z.string({
      required_error: "Password is required",
    }),
    customer: z.object({
      name: z.string({
        required_error: "Name is required!",
      }),
      email: z.string({
        required_error: "Email is required!",
      }),
      phone: z.string({
        required_error: "Phone numbers is required!",
      }),
      address: z.string({ required_error: "Address is Required!" }),
      profileImg: z.string().optional(),
    }),
  }),
});

export const UserValidations = {
  createAdminValidationSchema,
  createVendorValidationSchema,
  createCustomerValidationSchema,
};
