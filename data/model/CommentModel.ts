import firebase from "firebase/compat";
import FieldValue = firebase.firestore.FieldValue;

export interface CommentModel {
    text: string,
    uid: string,
    organization: boolean,
    username: string,
    date: FieldValue | string,
}