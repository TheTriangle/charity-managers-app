import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {CampaignModel} from "../../data/model/CampaignModel";
import {PostLocalModel} from "../../data/model/PostLocalModel";
import {requestCreateCampaign, requestGetCampaigns} from "../../data/repo/repository";

export const createCampaign = createAsyncThunk('campaigns/createCampaign', async (data : {
    documentID?: string,
    campaign: CampaignModel,
    pinnedPost: PostLocalModel
}) => {
    return await requestCreateCampaign(data)
})

export const getCampaign = createAsyncThunk('campaigns/getCampaign', async (data : {
    charityID: string
}) => {
    return await requestGetCampaigns(data)
})


interface initialStateType {
    createLoading: boolean,
    loading: boolean,
    editLoading: boolean,
    error: string | undefined | null,
    createError: string | undefined | null,
    editError: string | undefined | null,
    campaigns: CampaignModel[],
}

const initialState: initialStateType = {
    createLoading: false,
    loading: false,
    editLoading: false,
    error: null,
    createError: null,
    editError: null,
    campaigns: [],
}

const campaignsSlice = createSlice({
    name: 'charities',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createCampaign.pending, (state) => {
                state.createLoading = true
                state.createError = null
            })
            .addCase(createCampaign.fulfilled, (state, action) => {
                state.createLoading = false
                state.createError = null
                state.campaigns.push(action.payload)
            })
            .addCase(createCampaign.rejected, (state, action) => {
                state.createLoading = false
                state.createError = action.error.message ? action.error.message : ""
            })

            .addCase(getCampaign.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getCampaign.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.campaigns = action.payload
            })
            .addCase(getCampaign.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message ? action.error.message : ""
            })
    },
});


export default campaignsSlice.reducer