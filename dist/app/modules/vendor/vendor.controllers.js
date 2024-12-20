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
exports.VendorControllers = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const vendor_services_1 = require("./vendor.services");
const http_status_codes_1 = require("http-status-codes");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const vendorOnboarding = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vendor_services_1.VendorServices.vendorOnboardingInDB(req.user, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: "Vendor onboarded successfully!",
        data: result,
    });
}));
const getVendorShop = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vendor_services_1.VendorServices.getVendorShopFromDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Vendor Retrieved successfully!",
        data: result,
    });
}));
const followVendorShop = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vendor_services_1.VendorServices.followShopsInDB(req === null || req === void 0 ? void 0 : req.user, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Vendor Follow Status updated!",
        data: result,
    });
}));
const getFollowStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vendor_services_1.VendorServices.getFollowStatusFromDB(req === null || req === void 0 ? void 0 : req.user, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Follow Status Fetched!",
        data: result,
    });
}));
exports.VendorControllers = {
    vendorOnboarding,
    getVendorShop,
    followVendorShop,
    getFollowStatus,
};
