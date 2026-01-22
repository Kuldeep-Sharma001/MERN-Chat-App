import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    onlineUsers:[]
}
const socketSlice = createSlice({
    name: 'socket-io',
    initialState,
    reducers: {
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        }
    }
})

export const { setOnlineUsers } = socketSlice.actions;
export default socketSlice.reducer;