import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios/index";
import {auth} from "../../firebase/config";

export const getStatistics = createAsyncThunk('statistics/getStatistics', async (data : {
    id: string
    isCampaign: boolean
}) => {
    let requestBody
    let url
    if (data.isCampaign) {
        requestBody = {campaign: data.id}
        url = "https://us-central1-donapp-d2378.cloudfunctions.net/getCampaignAnalytics"
    } else {
        requestBody = {charity: data.id}
        url = "https://us-central1-donapp-d2378.cloudfunctions.net/getCharityAnalytics"
    }

    return (await axios.get<{
        uniqueDonorsOverall: number,
        uniqueDonorsMonth: number,
        subscribersStats: {
            month: string[],
            count: number[]
        },
        collectedAmountStats: {
            month: string[],
            amount: number[]
        }
    }>(url, {
        headers: {
            Authorization: await auth.currentUser!!.getIdToken()
        },
        params: requestBody
    })).data
})

interface initialStateType {
    loading: boolean,
    error: string | undefined | null,
    uniqueDonorsOverall: number,
    uniqueDonorsMonth: number,
    subscribersStats: {
        month: string[],
        count: number[]
    },
    collectedAmountStats: {
        month: string[],
        amount: number[]
    }
}

const initialState: initialStateType = {
    loading: false,
    error: null,
    uniqueDonorsOverall: 0,
    uniqueDonorsMonth: 0,
    subscribersStats: {
        month: ["1"],
        count: [1]
    },
    collectedAmountStats: {
        month: ["1"],
        amount: [1]
    }
}

const statisticsSlice = createSlice({
    name: 'statistics',
    initialState: initialState,
    reducers: {
        clearStatistics: (state) => {
            state = initialState
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getStatistics.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getStatistics.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.collectedAmountStats = action.payload.collectedAmountStats
                state.subscribersStats = action.payload.subscribersStats
                state.uniqueDonorsOverall = action.payload.uniqueDonorsOverall
                state.uniqueDonorsMonth = action.payload.uniqueDonorsMonth
            })
            .addCase(getStatistics.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message ? action.error.message : "err"
            })
    },
});

export const {
    clearStatistics
} = statisticsSlice.actions;

export default statisticsSlice.reducer