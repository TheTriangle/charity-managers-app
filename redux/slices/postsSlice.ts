import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {PostLocalModel, PostRemoteModel} from "../../data/model/PostLocalModel";
import {
    createPostRequest,
    getPostsRequest,
} from "../../data/repo/repository";
import {createComment} from "./commentsSlice";

export const createPost = createAsyncThunk('posts/createPost', async (data : {
    campaignID: string,
    post: PostLocalModel
}) => {
    return await createPostRequest(data)
})

export const getPosts = createAsyncThunk('posts/getPosts', async (data : {
    campaignID: string
}) => {
    return await getPostsRequest(data)
})

export const finishCampaign = createAsyncThunk('posts/finishCampaign', async (data : {
    campaignID: string,
    post: PostLocalModel
}) => {
    return {campaignID: data.campaignID, post: await createPostRequest(data)}
})


interface initialStateType {
    createLoading: boolean,
    loading: boolean,
    error: string | undefined | null,
    createError: string | undefined | null,
    pinnedPost: PostRemoteModel | null | undefined,
    posts: PostRemoteModel[],
}

const initialState: initialStateType = {
    createLoading: false,
    loading: false,
    error: null,
    createError: null,
    pinnedPost: null,
    posts: [],
}

const postsSlice = createSlice({
    name: 'posts',
    initialState: initialState,
    reducers: {
        clearPosts: (state) => {
            state.pinnedPost = null
            state.posts = []
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPost.pending, (state) => {
                state.createLoading = true
                state.createError = null
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.createLoading = false
                state.createError = null
                state.posts.unshift(action.payload)
            })
            .addCase(createPost.rejected, (state, action) => {
                state.createLoading = false
                state.createError = action.error.message ? action.error.message : ""
            })

            .addCase(getPosts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getPosts.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.pinnedPost = action.payload.find(value => value.pinned)
                state.posts = action.payload.filter(value => !value.pinned)
            })
            .addCase(getPosts.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message ? action.error.message : ""
            })

            .addCase(finishCampaign.pending, (state) => {
                state.createLoading = true
                state.createError = null
            })
            .addCase(finishCampaign.fulfilled, (state, action) => {
                state.createLoading = false
                state.createError = null
                state.posts.unshift(action.payload.post)
            })
            .addCase(finishCampaign.rejected, (state, action) => {
                state.createLoading = false
                state.createError = action.error.message ? action.error.message : ""
            })

            .addCase(createComment.fulfilled,(state, action) => {
                if (state.pinnedPost?.id === action.payload.post) {
                    state.pinnedPost.commentsCount += 1
                } else {
                    const index = state.posts.findIndex((post) => post.id === action.payload.post)
                    state.posts[index].commentsCount += 1
                }

            })
    },
});

export const {
    clearPosts
} = postsSlice.actions;

export default postsSlice.reducer