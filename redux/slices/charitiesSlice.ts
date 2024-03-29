import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {CharityModel} from "../../data/model/СharityModel";
import {getAllCharities, updateConfirmedCharity} from "../../data/repo/repository";
import {auth} from "../../firebase/config";
import axios from "axios";
import {TagModel} from "../../data/model/TagModel";

export const getCharities = createAsyncThunk('charities/getCharities', async () => {
    return await getAllCharities(auth.currentUser!!.uid)
})

export const createCharity = createAsyncThunk('charities/createCharity', async (charity: CharityModel) => {
    const response = await axios.post<{
        message: string,
        charityId: string
    }>("https://us-central1-donapp-d2378.cloudfunctions.net/createCharity", {charity: charity}, {
        headers: {
            Authorization: await auth.currentUser!!.getIdToken()
        }
    })
    return {...charity, id: response.data.charityId}
})

export const editCharity = createAsyncThunk('charities/editCharity', async (charity: CharityModel) => {
    await axios.post<{
        message: string,
        charityId: string
    }>("https://us-central1-donapp-d2378.cloudfunctions.net/updateCharity ", {charity: charity}, {
        headers: {
            Authorization: await auth.currentUser!!.getIdToken()
        }
    })
    return charity
})

export const editConfirmedCharity = createAsyncThunk('charities/editConfirmedCharity', async (data: {
    id: string
    address: string | undefined,
    briefDescription: string,
    description: string,
    location: LocationModel | undefined,
    managerContact: string,
    tags: TagModel[],
    url: string
}) => {
    await updateConfirmedCharity(data)
    return data
})

interface initialStateType {
    loading: boolean,
    editLoading: boolean,
    error: string | undefined | null,
    editError: string | undefined | null,
    confirmedCharities: CharityModel[],
    unconfirmedCharities: CharityModel[],
}

const initialState: initialStateType = {
    loading: true,
    editLoading: false,
    error: null,
    editError: null,
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
                state.editLoading = true
                state.editError = null
            })
            .addCase(createCharity.fulfilled, (state, action) => {
                state.editLoading = false
                state.unconfirmedCharities.push(action.payload)
            })
            .addCase(createCharity.rejected, (state, action) => {
                state.editLoading = false
                state.editError = action.error.message ? action.error.message : ""
            })

            .addCase(editCharity.pending, state => {
                state.editLoading = true
                state.editError = null
            })
            .addCase(editCharity.fulfilled, (state, action) => {
                state.editLoading = false
                const index = state.unconfirmedCharities.findIndex((charity) => charity.id === action.payload.id)
                state.unconfirmedCharities[index] = action.payload
            })
            .addCase(editCharity.rejected, (state, action) => {
                state.editLoading = false
                state.editError = action.error.message ? action.error.message : ""
            })

            .addCase(editConfirmedCharity.pending, state => {
                state.editLoading = true
                state.editError = null
            })
            .addCase(editConfirmedCharity.fulfilled, (state, action) => {
                state.editLoading = false
                const index = state.confirmedCharities.findIndex((charity) => charity.id === action.payload.id)
                state.confirmedCharities[index] = {...state.confirmedCharities[index], ...action.payload}
            })
            .addCase(editConfirmedCharity.rejected, (state, action) => {
                state.editLoading = false
                state.editError = action.error.message ? action.error.message : ""
            })

    },
});


export default profileSlice.reducer