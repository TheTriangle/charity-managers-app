import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {
    getCommentsRequest,
    requestCreateComment,
} from "../../data/repo/repository";
import {CommentModel} from "../../data/model/CommentModel";

export const createComment = createAsyncThunk('comments/createComment', async (data : {
    campaignID: string,
    postID: string,
    comment: CommentModel
}) => {
    return {comment: await requestCreateComment(data), post: data.postID}
})

export const getComments = createAsyncThunk('comments/getComments', async (data : {
    postID: string,
    campaignID: string
}) => {
    return await getCommentsRequest(data)
})


interface initialStateType {
    createLoading: boolean,
    loading: boolean,
    error: string | undefined | null,
    createError: string | undefined | null,
    comments: CommentModel[],
}

const initialState: initialStateType = {
    createLoading: false,
    loading: false,
    error: null,
    createError: null,
    comments: [],
}

const commentsSlice = createSlice({
    name: 'comments',
    initialState: initialState,
    reducers: {
        clearComments: (state) => {
            state.comments = []
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createComment.pending, (state) => {
                state.loading = true
                state.createError = null
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.loading = false
                state.createError = null
                state.comments.push(action.payload.comment)
            })
            .addCase(createComment.rejected, (state, action) => {
                state.loading = false
                state.createError = action.error.message ? action.error.message : ""
            })

            .addCase(getComments.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getComments.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.comments = action.payload
            })
            .addCase(getComments.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message ? action.error.message : ""
            })
    },
});

export const {
    clearComments
} = commentsSlice.actions;

export default commentsSlice.reducer