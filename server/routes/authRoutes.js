import express from "express"
import { register,login,logout } from "../controllers/authController.js";
export const authRouter= express.Router();

authRouter.post("/register",register);  //api will be   /api/auth/register
authRouter.post("/login",login);
authRouter.post("/logout",logout);

