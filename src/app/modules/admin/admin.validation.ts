import { z } from "zod";

const createAdminValidation = z.object({
  body: z.object({
    email: z.string({ required_error: "Please Provide an Email!" }),
  }),
});

export const AdminValidation = {
  createAdminValidation,
};
