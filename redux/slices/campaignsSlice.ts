import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {CampaignModel} from "../../data/model/CampaignModel";
import {PostLocalModel} from "../../data/model/PostLocalModel";
import {requestCreateCampaign, requestGetCampaigns} from "../../data/repo/repository";
import {finishCampaign} from "./postsSlice";

export const createCampaign = createAsyncThunk('campaigns/createCampaign', async (data: {
    documentID?: string,
    campaign: CampaignModel,
    pinnedPost: PostLocalModel
}) => {
    return await requestCreateCampaign(data)
})

export const getCampaigns = createAsyncThunk('campaigns/getCampaign', async (data: {
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
    name: 'campaigns',
    initialState: initialState,
    reducers: {
        clearCampaigns: (state) => {
            state.campaigns = []
        },
    },
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

            .addCase(getCampaigns.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getCampaigns.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.campaigns = action.payload
            })
            .addCase(getCampaigns.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message ? action.error.message : ""
            })

            .addCase(finishCampaign.fulfilled, (state, action) => {
                // find campaign in list of camigns and set closed to true
                const campaignIndex = state.campaigns.findIndex(campaign => campaign.id === action.payload.campaignID);
                if (campaignIndex !== -1) {
                    state.campaigns[campaignIndex].closed = true;
                }
            })
    },
});

export const {
    clearCampaigns
} = campaignsSlice.actions;

export default campaignsSlice.reducer