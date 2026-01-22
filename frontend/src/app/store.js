import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/auth";
import userReducer from './slice/user';
import socketReducer from './slice/socket';
const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        socket: socketReducer
    }
})
export default store;