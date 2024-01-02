import firebase from "firebase/compat";
import firestore = firebase.firestore;

export const userExists = async (
    email: string,
) => {
    const doc = await firestore().collection("managers")
        .where("email", "==", email).get()
    return !doc.empty
}
