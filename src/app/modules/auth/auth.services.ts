import { UserStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import { JwtPayload, Secret } from "jsonwebtoken";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { sendEmail } from "../../../helpers/sendEmail";
import { generatePasswordResetEmailTemplate } from "../../../helpers/generatePasswordResetEmail";

const loginUser = async (payload: { email: string; password: string }) => {
  // checking user exists in the db
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  // comparing password
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  // throwing error for wrong password
  if (!isCorrectPassword) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Password doesn't match!");
  }

  // generating access token and refresh token
  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  // decoding refresh token
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret
    );
  } catch (err) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
  }

  // checking if the user exists in the db
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  // generating new access token
  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const changePassword = async (
  user: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  // checking if the user exists in the db
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  // comparing password
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Password doesn't match!");
  }

  // hashing the new password
  const hashedPassword: string = await bcrypt.hash(
    payload.newPassword,
    Number(config.salt_rounds)
  );

  // updating the new password
  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password updated successfully!",
  };
};

const forgotPassword = async (payload: { email: string }) => {
  // checking if the user exist
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  // generating reset password token
  const resetPassToken = jwtHelpers.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_token_expires_in as string
  );

  // reset password ui link
  const resetPassLink = `${config.reset_pass_link}/reset-password?userId=${userData.id}&token=${resetPassToken}`;

  // getting the email body
  const emailBody = generatePasswordResetEmailTemplate({
    resetPassLink,
    companyName: "Vendozy",
  });

  // sending email through utility function
  await sendEmail(userData.email, emailBody);

  return {
    message: "Password reset link sent to your email",
  };
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.jwt.reset_pass_secret as Secret
  );

  if (!isValidToken) {
    throw new AppError(StatusCodes.FORBIDDEN, "Token is not valid!");
  }

  // generating hash password
  const password = await bcrypt.hash(
    payload.password,
    Number(config.salt_rounds)
  );

  // update password in the database
  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
    },
  });

  return { message: "Password Reset successfully!" };
};

export const AuthServices = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword
};
