import express from "express";
import path from "path"; 
import dbConnect from "./config/dbConnection.js";
import authRoutes from "./routes/authRoutes.js";
import { verifyToken } from "./middlewares/verifyToken.js";
import userRoutes from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import cors from "cors";
import { app, server } from "./socket/socket.js";

dbConnect();

const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
  }),
);

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api", authRoutes);
app.use("/", verifyToken, userRoutes);
app.use("/message", verifyToken, messageRouter);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
