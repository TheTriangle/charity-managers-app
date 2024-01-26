import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {CharityModel} from "../../data/model/СharityModel";
import {getAllCharities} from "../../data/repo/repository";
import {auth} from "../../firebase/config";

export const getCharities = createAsyncThunk('charities/getCharities', async () => {
    return await getAllCharities(auth.currentUser!!.uid)
})

interface initialStateType {
    loading: boolean,
    error: string | undefined | null,
    confirmedCharities: CharityModel[],
    unconfirmedCharities: CharityModel[],
}

const initialState: initialStateType = {
    loading: true,
    error: null,
    confirmedCharities: [],
    unconfirmedCharities: []
}

const profileSlice = createSlice({
    name: 'charities',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getCharities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCharities.fulfilled, (state, action) => {
                state.confirmedCharities = action.payload.filter(value => value.confirmed)
                state.unconfirmedCharities = action.payload.filter(value => !value.confirmed)
                state.loading = false
                state.error = null
            })
            .addCase(getCharities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ? action.error.message : "";
            })
    },
});


export default profileSlice.reducer