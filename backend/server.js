import express from 'express';
import dbConnect from './config/dbConnection.js';
dbConnect();
import authRoutes from './routes/authRoutes.js';
import { verifyToken } from './middlewares/verifyToken.js';
import userRoutes from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import cors from 'cors';
const app = express();
const port = process.env.PORT || 3000;

app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials:true
    }
))
app.use(express.json());
app.use("/api", authRoutes);
app.use("/", verifyToken, userRoutes);
app.use("/message", verifyToken, messageRouter);

app.listen(port, () => {
    console.log("Server is running on port", port);
})
