"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwtHelpers_1 = require("../../helpers/jwtHelpers");
const config_1 = __importDefault(require("../../config"));
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../errors/AppError"));
const prisma_1 = __importDefault(require("../../shared/prisma"));
const client_1 = require("@prisma/client");
const auth = (...roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token = req.headers.authorization;
            if (!token) {
                throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "You are not authorized!");
            }
            let verifiedUser;
            try {
                verifiedUser = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.jwt_secret);
            }
            catch (error) {
                throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Your token is invalid!");
            }
            req.user = verifiedUser;
            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You can't access this route!");
            }
            // checking user exists in the DB
            const userData = yield prisma_1.default.user.findUniqueOrThrow({
                where: {
                    email: verifiedUser.email,
                },
            });
            // checking if the user is suspended
            if (userData.status === client_1.UserStatus.SUSPENDED) {
                throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "Your Account has been suspended!");
            }
            // checking if the user is deleted
            if (userData.status === client_1.UserStatus.DELETED) {
                throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "Your Account has been deleted!");
            }
            next();
        }
        catch (err) {
            next(err);
        }
    });
};
exports.default = auth;
