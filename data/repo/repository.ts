import {auth} from "../../firebase/config";
import {AuthMethods} from "../model/authMethods";
import firebase from "firebase/compat";
import firestore = firebase.firestore;
import NetInfo from "@react-native-community/netinfo";

export const userExists = async (
    email: string,
) => {
    const methods = await auth.fetchSignInMethodsForEmail(email)
    let result = AuthMethods.NONE
    if (methods.includes("password")) {
        result |= AuthMethods.EMAIL
    }
    if (methods.includes("google.com")) {
        result |= AuthMethods.GOOGLE
    }
    if (methods.includes("apple.com")) {
        result |= AuthMethods.APPLE
    }
    return result
}

export const hasManagerAccount = async () => {
    const doc = await firestore().collection("users").doc(auth.currentUser?.uid).get()
    if (doc.exists) {
        const data = doc.data()
        return data!.hasOwnProperty("managerName")
    } else {
        return false
    }
}

export const fillManagerData = async (managerData: {
    aim: string[],
    managerName: string,
    phone: string,
    social?: string,
    managerDescription?: string
}) => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
        const doc = firestore().collection("users").doc(auth.currentUser?.uid)
        await doc.update(managerData)
    } else {
        throw Error("No internet connection")
    }
}
