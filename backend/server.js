import express from 'express';
import dbConnect from './config/dbConnection.js';
dbConnect();
import authRoutes from './routes/authRoutes.js';
import { verifyToken } from './middlewares/verifyToken.js';
import userRoutes from './routes/userRoutes.js';
const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use("/api", authRoutes);
app.use("/user", verifyToken, userRoutes)
app.get("/", verifyToken, (req, res) => {
    console.log("token verified")
    res.status(200).json({message:"token verification complete", user:req.userData})
})
app.listen(port, () => {
    console.log("Server is running on port", port);
})
