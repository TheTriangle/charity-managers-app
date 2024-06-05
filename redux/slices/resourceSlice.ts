import {createSlice} from '@reduxjs/toolkit';
import {TagModel} from "../../data/model/TagModel";


interface initialStateType {
    tags: TagModel[]
}

const initialState: initialStateType = {
    tags: [
        {
            id: 1, title: "kids"
        },
        {
            id: 2, title: "families"
        },
        {
            id: 3, title: "animals"
        },
        {
            id: 4, title: "healthcare"
        },
        {
            id: 5, title: "homeless"
        },
        {
            id: 6, title: "terminally ill"
        },
        {
            id: 7, title: "religious"
        },
        {
            id: 8, title: "quality of life"
        },


    ]
}

const resourceSlice = createSlice({
    name: 'resource',
    initialState: initialState,
    reducers: {},
});


export default resourceSlice.reducer