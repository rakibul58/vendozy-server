"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("../modules/user/user.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
const category_routes_1 = require("../modules/categories/category.routes");
const product_routes_1 = require("../modules/products/product.routes");
const vendor_routes_1 = require("../modules/vendor/vendor.routes");
const cart_routes_1 = require("../modules/cart/cart.routes");
const coupon_routes_1 = require("../modules/coupon/coupon.routes");
const order_routes_1 = require("../modules/order/order.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: "/users",
        route: user_routes_1.UserRoutes,
    },
    {
        path: "/vendors",
        route: vendor_routes_1.VendorRoutes,
    },
    {
        path: "/auth",
        route: auth_routes_1.AuthRoutes,
    },
    {
        path: "/categories",
        route: category_routes_1.CategoryRoutes,
    },
    {
        path: "/products",
        route: product_routes_1.ProductRoutes,
    },
    {
        path: "/carts",
        route: cart_routes_1.CartRoutes,
    },
    {
        path: "/coupons",
        route: coupon_routes_1.CouponRoutes,
    },
    {
        path: "/orders",
        route: order_routes_1.OrderRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
