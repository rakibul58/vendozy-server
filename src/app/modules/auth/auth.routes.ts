import { Router } from "express";
import { AuthControllers } from "./auth.controllers";

const router = Router();

router.route("/login").post(AuthControllers.loginUser);

export const AuthRoutes = router;
