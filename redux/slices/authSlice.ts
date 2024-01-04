import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {GoogleAuthProvider} from "firebase/auth";
import {auth} from "../../firebase/config";

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


interface initialStateType {
    loading: boolean,
    error: string | undefined | null,
}

const initialState: initialStateType = {
    loading: false,
    error: null,}

const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(signInAsyncGoogle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signInAsyncGoogle.fulfilled, (state, action) => {
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
                state.loading = false;
            })
            .addCase(signUpAsyncEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    },
});

export default authSlice.reducer