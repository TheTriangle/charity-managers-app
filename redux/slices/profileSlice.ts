import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {createContactUsRequest, fillManagerData, updateContacts} from "../../data/repo/repository";
import {hasProfile} from "./authSlice";

export const updateManagerInfo = createAsyncThunk('profile/updateManagerInfo',
    async (managerData: {
        aim: string[],
        managerName: string,
        phone: string,
        social?: string,
        managerDescription?: string
    }) => {
        await fillManagerData(managerData)
        return managerData
    });

export const createSupportRequest = createAsyncThunk('profile/createSupportRequest',
    async (data: {
        contact: string,
        title: string,
        text: string,
    }) => {
        await createContactUsRequest(data)
    });

export const updateContactsRequest = createAsyncThunk('profile/updateContactsRequest',
    async (data: {
        phone: string,
        social: string,
    }) => {
        await updateContacts(data)
        return data
    });


interface initialStateType {
    loading: boolean,
    error: string | undefined | null,
    aim: string[],
    managerName: string,
    phone: string,
    social: string,
    managerDescription: string
}

const initialState: initialStateType = {
    loading: false,
    error: null,
    aim: [],
    managerName: "",
    phone: "",
    social: "",
    managerDescription: ""
}

const profileSlice = createSlice({
    name: 'profile',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(updateManagerInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateManagerInfo.fulfilled, (state, action) => {
                return {...state, loading: false, error: null, ...action.payload}
            })
            .addCase(updateManagerInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(createSupportRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createSupportRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(createSupportRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(updateContactsRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateContactsRequest.fulfilled, (state, action) => {
                state.phone = action.payload.phone
                state.social = action.payload.social
                state.loading = false;
                state.error = null;
            })
            .addCase(updateContactsRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(hasProfile.fulfilled, (state, action) => {
                state.phone = action.payload.phone ? action.payload.phone : ""
                state.social = action.payload.social ? action.payload.social : ""
                state.loading = false;
            })
    },
});


export default profileSlice.reducer