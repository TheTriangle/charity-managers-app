import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {fillManagerData} from "../../data/repo/repository";
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
    reducers: {

    },
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
    },
});


export default profileSlice.reducer