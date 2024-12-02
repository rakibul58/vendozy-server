import { Router } from "express";
import { AuthControllers } from "./auth.controllers";

const router = Router();

router.route("/login").post(AuthControllers.loginUser);
router.route("/refresh-token").post(AuthControllers.refreshToken);

export const AuthRoutes = router;
