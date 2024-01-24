import {configureStore} from '@reduxjs/toolkit';
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice"
import charitiesReducer from "./slices/charitiesSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        profile: profileReducer,
        charities: charitiesReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch