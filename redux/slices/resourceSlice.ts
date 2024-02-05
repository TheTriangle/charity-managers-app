import {createSlice} from '@reduxjs/toolkit';
import {TagModel} from "../../data/model/TagModel";


interface initialStateType {
    tags: TagModel[]
}

const initialState: initialStateType = {
    tags: [
        {
            id: 1, title: "дети"
        },
        {
            id: 2, title: "семьи"
        },
        {
            id: 3, title: "животные"
        },
        {
            id: 4, title: "инвалиды"
        },
        {
            id: 5, title: "бездомные"
        },
        {
            id: 6, title: "незлечимо больные"
        },
        {
            id: 7, title: "религиозные"
        },
        {
            id: 8, title: "улучшение жизни"
        },


    ]
}

const resourceSlice = createSlice({
    name: 'resource',
    initialState: initialState,
    reducers: {},
});


export default resourceSlice.reducer