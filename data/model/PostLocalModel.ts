import firebase from "firebase/compat";
import FieldValue = firebase.firestore.FieldValue;

export interface PostLocalModel {
    header: string
    fulltext: string
    documents?: { uri: string, name: string }[]
    images?: string[]
    pinned: boolean
    likesCount: number
    commentsCount: number
    date: FieldValue
}

export interface PostRemoteModel {
    id: string,
    header: string
    fulltext: string
    documents?: { uri: string, name: string }[]
    images?: string[]
    pinned: boolean
    likesCount: number
    commentsCount: number
    date: string
}