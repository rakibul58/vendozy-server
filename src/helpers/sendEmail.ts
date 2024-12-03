import nodemailer from 'nodemailer';
import config from '../config';
import { StatusCodes } from 'http-status-codes';
import AppError from '../app/errors/AppError';

export const sendEmail = async (to: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: config.sender_email,
        pass: config.sender_password,
      },
    });

    const result = await transporter.sendMail({
      from: 'rakibulhasan50415714@gmail.com', // sender address
      to, // list of receivers
      subject: 'Reset your password within five mins!', // Subject line
      text: html, // plain text body
      html, // html body
    });

    return result;
  } catch (error) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Something went wrong');
  }
};
