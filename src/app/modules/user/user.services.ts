import config from "../../../config";
import { adminPayload } from "./user.interface";
import * as bcrypt from "bcrypt";
import { Admin, UserRole } from "@prisma/client";
import prisma from "../../../shared/prisma";

const createAdminInDb = async (payload: adminPayload): Promise<Admin> => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.salt_rounds)
  );

  const userData = {
    email: payload.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    const userInsertData = await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: {
        userId: userInsertData.id,
        ...payload.admin,
      },
    });

    return createdAdminData;
  });

  return result;
};

export const UserServices = {
  createAdminInDb,
};
