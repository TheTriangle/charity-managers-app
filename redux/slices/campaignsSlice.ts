import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {CampaignModel} from "../../data/model/CampaignModel";
import {PostLocalModel} from "../../data/model/PostLocalModel";
import {
    requestCreateCampaign,
    requestGetCampaigns,
    requestGetPaymentConfirmation,
    requestUpdateCampaign
} from "../../data/repo/repository";
import {finishCampaign} from "./postsSlice";
import axios from "axios/index";
import {auth} from "../../firebase/config";
import {requestDeletion} from "./charitiesSlice";
import {TagModel} from "../../data/model/TagModel";

export const createCampaign = createAsyncThunk('campaigns/createCampaign', async (data: {
    documentID: string,
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

export const updateCampaign = createAsyncThunk('campaigns/updateCampaign', async (data: {
    id: string,
    tags: TagModel[],
    increment: number,
    totalAmount: number
    date: string,
    highPriority: boolean
}) => {
    await requestUpdateCampaign(data)
    return data
})

export const requestCreatePayment = createAsyncThunk('campaigns/requestCreatePayment', async (data: {
    secret: string,
    yoomoney: string
}) => {
    const response = await axios.post<{
        campaignId: string
    }>("https://us-central1-donapp-d2378.cloudfunctions.net/createCampaignAndPayment", {secret: data.secret, yoomoney: data.yoomoney, ownerId: auth.currentUser!!.uid}, {
        headers: {
            Authorization: await auth.currentUser!!.getIdToken()
        }
    })
    return response.data.campaignId
})

export const getPaymentConfirmation = createAsyncThunk('campaigns/getPaymentConfirmation', async (data: {
    campaign: string
}) => {
    return await requestGetPaymentConfirmation(data.campaign)
})

interface initialStateType {
    createLoading: boolean,
    loading: boolean,
    editLoading: boolean,
    updateLoading: boolean,
    error: string | undefined | null,
    createError: string | undefined | null,
    editError: string | undefined | null,
    campaigns: CampaignModel[],
}

const initialState: initialStateType = {
    createLoading: false,
    loading: false,
    editLoading: false,
    updateLoading: false,
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

            .addCase(requestCreatePayment.pending, (state) => {
                state.createLoading = true
                state.createError = null
            })
            .addCase(requestCreatePayment.fulfilled, (state, action) => {
                state.createLoading = false
                state.createError = null
            })
            .addCase(requestCreatePayment.rejected, (state, action) => {
                state.createLoading = false
                state.createError = action.error.message ? action.error.message : ""
            })

            .addCase(getPaymentConfirmation.pending, (state) => {
                state.createLoading = true
                state.createError = null
            })
            .addCase(getPaymentConfirmation.fulfilled, (state, action) => {
                state.createLoading = false
                state.createError = null
            })
            .addCase(getPaymentConfirmation.rejected, (state, action) => {
                state.createLoading = false
                state.createError = action.error.message ? action.error.message : ""
            })

            .addCase(requestDeletion.pending, (state) => {
                state.loading = true
            })
            .addCase(requestDeletion.fulfilled, (state, action) => {
                state.loading = false
            })
            .addCase(requestDeletion.rejected, (state, action) => {
                state.loading = false
            })

            .addCase(updateCampaign.pending, (state) => {
                state.updateLoading = true
            })
            .addCase(updateCampaign.fulfilled, (state, action) => {
                state.updateLoading = false
                const index = state.campaigns.findIndex(campaign => campaign.id == action.payload.id)
                state.campaigns[index] = {
                    ...state.campaigns[index],
                    tags: action.payload.tags,
                    collectedamount: state.campaigns[index].collectedamount + action.payload.increment,
                    totalamount: action.payload.totalAmount,
                    enddate: action.payload.date,
                    highPriority: action.payload.highPriority
                }
            })
            .addCase(updateCampaign.rejected, (state, action) => {
                state.updateLoading = false
            })

            .addCase(finishCampaign.fulfilled, (state, action) => {
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