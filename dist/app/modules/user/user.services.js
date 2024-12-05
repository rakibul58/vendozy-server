"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.UserServices = void 0;
const config_1 = __importDefault(require("../../../config"));
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const createAdminInDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt.hash(payload.password, Number(config_1.default.salt_rounds));
    const userData = {
        email: payload.admin.email,
        password: hashedPassword,
        role: client_1.UserRole.ADMIN,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const userInsertData = yield transactionClient.user.create({
            data: userData,
        });
        const createdAdminData = yield transactionClient.admin.create({
            data: Object.assign({ userId: userInsertData.id }, payload.admin),
        });
        return createdAdminData;
    }));
    return result;
});
const createVendorInDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt.hash(payload.password, Number(config_1.default.salt_rounds));
    const userData = {
        email: payload.vendor.email,
        password: hashedPassword,
        role: client_1.UserRole.VENDOR,
    };
    const vendorSignUp = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const userInsertData = yield transactionClient.user.create({
            data: userData,
        });
        const createdVendorData = yield transactionClient.vendor.create({
            data: Object.assign({ userId: userInsertData.id }, payload.vendor),
        });
        return createdVendorData;
    }));
    // generating access token and refresh token
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
        email: vendorSignUp.email,
        role: client_1.UserRole.VENDOR,
    }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
    const refreshToken = jwtHelpers_1.jwtHelpers.generateToken({
        email: userData.email,
        role: userData.role,
    }, config_1.default.jwt.refresh_token_secret, config_1.default.jwt.refresh_token_expires_in);
    return {
        accessToken,
        refreshToken,
        needPasswordChange: false,
    };
});
const createCustomerInDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt.hash(payload.password, Number(config_1.default.salt_rounds));
    const userData = {
        email: payload.customer.email,
        password: hashedPassword,
        role: client_1.UserRole.CUSTOMER,
    };
    const customerSignup = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const userInsertData = yield transactionClient.user.create({
            data: userData,
        });
        const createdVendorData = yield transactionClient.customer.create({
            data: Object.assign({ userId: userInsertData.id }, payload.customer),
        });
        return createdVendorData;
    }));
    // generating access token and refresh token
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
        email: customerSignup.email,
        role: client_1.UserRole.CUSTOMER,
    }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
    const refreshToken = jwtHelpers_1.jwtHelpers.generateToken({
        email: userData.email,
        role: userData.role,
    }, config_1.default.jwt.refresh_token_secret, config_1.default.jwt.refresh_token_expires_in);
    return {
        accessToken,
        refreshToken,
        needPasswordChange: false,
    };
});
const getUserProfileFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    if (user.role === client_1.UserRole.ADMIN) {
        return prisma_1.default.admin.findUniqueOrThrow({
            where: {
                email: user.email,
            },
        });
    }
    else if (user.role === client_1.UserRole.VENDOR) {
        return prisma_1.default.vendor.findUniqueOrThrow({
            where: {
                email: user.email,
            },
        });
    }
    else
        return prisma_1.default.customer.findUniqueOrThrow({
            where: {
                email: user.email,
            },
        });
});
exports.UserServices = {
    createAdminInDb,
    createVendorInDB,
    createCustomerInDB,
    getUserProfileFromDB,
};
