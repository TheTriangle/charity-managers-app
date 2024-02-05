import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {CharityModel} from "../../data/model/СharityModel";
import {getAllCharities} from "../../data/repo/repository";
import {auth} from "../../firebase/config";
import axios from "axios";

export const getCharities = createAsyncThunk('charities/getCharities', async () => {
    return await getAllCharities(auth.currentUser!!.uid)
})

export const createCharity = createAsyncThunk('charities/createCharity', async (charity: CharityModel) => {
    const response = await axios.post<{message: string, charityId: string}>("https://us-central1-donapp-d2378.cloudfunctions.net/createCharity", {charity: charity}, {
        headers: {
            Authorization: await auth.currentUser!!.getIdToken()
        }
    })

    return {...charity, id: response.data.charityId}
})

interface initialStateType {
    loading: boolean,
    creationLoading: boolean,
    error: string | undefined | null,
    creationError: string | undefined | null,
    confirmedCharities: CharityModel[],
    unconfirmedCharities: CharityModel[],
}

const initialState: initialStateType = {
    loading: true,
    creationLoading: false,
    error: null,
    creationError: null,
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
                state.loading = true
                state.error = null
            })
            .addCase(getCharities.fulfilled, (state, action) => {
                state.confirmedCharities = action.payload.filter(value => value.confirmed)
                state.unconfirmedCharities = action.payload.filter(value => !value.confirmed)
                state.loading = false
                state.error = null
            })
            .addCase(getCharities.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message ? action.error.message : ""
            })

            .addCase(createCharity.pending, state => {
                state.creationLoading = true
                state.creationError = null
            })
            .addCase(createCharity.fulfilled, (state, action) => {
                state.creationLoading = false
                state.unconfirmedCharities.push(action.payload)
            })
            .addCase(createCharity.rejected, (state, action) => {
                state.creationLoading = false
                state.creationError = action.error.message ? action.error.message : ""
            })

    },
});


export default profileSlice.reducer