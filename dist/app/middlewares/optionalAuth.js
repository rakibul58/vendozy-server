"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = void 0;
const jwtHelpers_1 = require("../../helpers/jwtHelpers");
const config_1 = __importDefault(require("../../config"));
const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        try {
            const verifiedUser = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.jwt_secret);
            req.user = verifiedUser;
        }
        catch (error) {
            // If token is invalid, continue without user
            req.user = undefined;
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
