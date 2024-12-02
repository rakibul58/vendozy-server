import { z } from "zod";
import { UserValidations } from "./user.validations";

export type adminPayload = z.infer<
  typeof UserValidations.createAdminValidationSchema
>;
