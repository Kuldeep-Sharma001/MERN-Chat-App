import express from 'express';
import { getAllUsers } from '../controllers/userController.js';
const userRoutes = express.Router();

userRoutes.get('/allusers', getAllUsers);

export default userRoutes;