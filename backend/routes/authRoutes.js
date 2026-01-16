import express from "express";
const authRoutes = express.Router();
import { login, signup } from "../controllers/authController.js";

authRoutes.post('/signup', signup);
authRoutes.post('/login', login);

export default authRoutes;