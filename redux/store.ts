import {configureStore} from '@reduxjs/toolkit';
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice"
import charitiesReducer from "./slices/charitiesSlice"
import resourceReducer from "./slices/resourceSlice";
import campaignsReducer from "./slices/campaignsSlice";
import postsReducer from "./slices/postsSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        profile: profileReducer,
        charities: charitiesReducer,
        resource: resourceReducer,
        campaigns: campaignsReducer,
        posts: postsReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch