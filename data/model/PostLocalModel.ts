import firebase from "firebase/compat";
import FieldValue = firebase.firestore.FieldValue;

export interface PostLocalModel {
    header: string
    fulltext: string
    documents?: {uri: string, name: string}[]
    images?: string[]
    pinned: boolean,
    date: FieldValue
}

export interface PostRemoteModel {
    header: string
    fulltext: string
    documents?: string[]
    images?: string[]
    pinned: boolean
}