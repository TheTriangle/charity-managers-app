import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {GoogleAuthProvider} from "firebase/auth";
import {auth} from "../../firebase/config";
import {hasManagerAccount} from "../../data/repo/repository";
import {updateManagerInfo} from "./profileSlice";

export const signInAsyncGoogle = createAsyncThunk('auth/signInAsyncGoogle',
    async () => {
        const {idToken} = await GoogleSignin.signIn()
        const googleCredential = GoogleAuthProvider.credential(idToken);
        await auth.signInWithCredential(googleCredential)
    });

export const signInAsyncEmail = createAsyncThunk('auth/signInAsyncEmail', async (credentials: {
    email: string,
    password: string
}) => {
    await auth.signInWithEmailAndPassword(credentials.email, credentials.password)
})

export const signUpAsyncEmail = createAsyncThunk('auth/signUpAsyncEmail', async (credentials: {
    email: string,
    password: string
}) => {
    await auth.createUserWithEmailAndPassword(credentials.email, credentials.password)
})

export const hasProfile = createAsyncThunk('auth/hasProfile',
    async () => {
        return await hasManagerAccount()
    });

export const signOut = createAsyncThunk('auth/signOut', async () => {
    await auth.signOut()
    await GoogleSignin.signOut()
})


interface initialStateType {
    loading: boolean,
    error: string | undefined | null,
    authorized: boolean,
    hasProfile: boolean,
}

const initialState: initialStateType = {
    loading: false,
    error: null,
    authorized: false,
    hasProfile: false
}

const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        authorize: (state) => {
            state.authorized = true
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(signInAsyncGoogle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signInAsyncGoogle.fulfilled, (state, action) => {
                state.authorized = true
                state.loading = false;
            })
            .addCase(signInAsyncGoogle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(signInAsyncEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signInAsyncEmail.fulfilled, (state, action) => {
                state.authorized = true
                state.loading = false;
            })
            .addCase(signInAsyncEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(signUpAsyncEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signUpAsyncEmail.fulfilled, (state, action) => {
                state.authorized = true
                state.loading = false;
            })
            .addCase(signUpAsyncEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(signOut.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signOut.fulfilled, (state, action) => {
                state.authorized = false
                state.loading = false;
            })
            .addCase(signOut.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(hasProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(hasProfile.fulfilled, (state, action) => {
                state.hasProfile = action.payload
                state.loading = false;
            })
            .addCase(hasProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(updateManagerInfo.fulfilled, (state, action) => {
                state.hasProfile = true
            })
    },
});

export const {
    authorize
} = authSlice.actions;

export default authSlice.reducer