import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
const uri = process.env.DB_URI;
if (!uri) {
    console.log("URI not got from .env");
}
const dbConnect = () => {
    mongoose.connect(uri)
        .then(() => {
            console.log("Connected to the DB successfully");
        })
        .catch(error=>{
        console.log("DB connection error: ", error.message);
    })
}
export default dbConnect;