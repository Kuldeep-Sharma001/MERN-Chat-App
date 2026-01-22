import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userData: JSON.parse(localStorage.getItem('userc')) || null
}
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserData: function (state, action) {
            state.userData = action.payload;
        }
    }
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;
