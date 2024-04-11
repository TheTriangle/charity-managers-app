import {auth} from "../../firebase/config";
import {AuthMethods} from "../model/authMethods";
import firebase from "firebase/compat";
import NetInfo from "@react-native-community/netinfo";
import {CharityModel} from "../model/СharityModel";
import {TagModel} from "../model/TagModel";
import {CampaignModel} from "../model/CampaignModel";
import {PostLocalModel, PostRemoteModel} from "../model/PostLocalModel";
import firestore = firebase.firestore;
import {getStorage, ref, uploadBytes, getDownloadURL} from "firebase/storage";

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

export const getAllCharities = async (uid: string) => {

    const docs = await firestore().collection("charities").where("creatorid", "==", uid).get()
    if (!docs.empty) {
        return docs.docs.map(value => value.data() as CharityModel)
    } else {
        return []
    }
}

export const updateConfirmedCharity = async (data: {
    id: string
    address: string | undefined,
    briefDescription: string,
    description: string,
    location: LocationModel | undefined,
    managerContact: string,
    tags: TagModel[],
    url: string
}) => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
        await firestore().collection("charities").doc(data.id).update(data)
    } else {
        throw Error("No internet connection")
    }
}

const uploadFile = async (uri: string, name: string, campaignID: string) => {

    const storage = getStorage()

    const fileRef = ref(storage, `campaigns/${campaignID}/attachments/${name}`)

    const response = await fetch(uri);
    const blob = await response.blob();

    await uploadBytes(fileRef, blob)


    return await getDownloadURL(fileRef)
};

const uploadPhoto = async (uri: string, campaignID: string) => {

    const storage = getStorage()

    const fileRef = ref(storage, `campaigns/${campaignID}/attachments/${uri}`)

    const response = await fetch(uri);
    const blob = await response.blob();

    await uploadBytes(fileRef, blob)

    return await getDownloadURL(fileRef)
};


const uploadFiles = async (files: { uri: string, name: string }[], campaignID: string) => {
    return await Promise.all(files.map(value => uploadFile(value.uri, value.name, campaignID)));
};

const uploadPhotos = async (photos: string[], campaignID: string) => {
    return await Promise.all(photos.map(value => uploadPhoto(value, campaignID)));
};

export const createPostRequest = async (data: {
    campaignID: string,
    post: PostLocalModel
}) => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
        const formatter = new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'});
        const postRef = firestore().collection("campaigns").doc(data.campaignID).collection("posts").doc()
        const [files, images] = await Promise.all([data.post.documents && uploadFiles(data.post.documents, data.campaignID),
            data.post.images && uploadPhotos(data.post.images, data.campaignID)])
        const documents = files?.map((value, index) => {
            return {
                uri: value,
                name: data.post.documents!![index].name
            }})
        await postRef.set({...data.post, images: images, documents: documents})
        const post = await postRef.get()
        return {...post.data(), date: formatter.format(post.data()!!.date.toDate())} as PostRemoteModel
    } else {
        throw Error("No internet connection")
    }
}

export const requestCreateCampaign = async (data: {
    documentID?: string
    campaign: CampaignModel
    pinnedPost: PostLocalModel
}) => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
        const batch = firestore().batch()
        if (data.documentID) {
            const campaignRef = firestore().collection("campaigns").doc(data.documentID)

            const [files, images] = await Promise.all([data.pinnedPost.documents && uploadFiles(data.pinnedPost.documents, campaignRef.id),
                data.pinnedPost.images && uploadPhotos(data.pinnedPost.images, campaignRef.id)])

            batch.update(campaignRef, data.campaign)
            const postRef = firestore().collection("campaigns").doc(campaignRef.id).collection("posts").doc()
            const documents = files?.map((value, index) => {
                return {
                    uri: value,
                    name: data.pinnedPost.documents!![index].name
                }})
            batch.set(postRef, {...data.pinnedPost, images: images, documents: documents, id: postRef.id})
            await batch.commit()
            return {...data.campaign, id: campaignRef.id} as CampaignModel
        } else {
            const campaignRef = firestore().collection("campaigns").doc()

            const [files, images] = await Promise.all([data.pinnedPost.documents && uploadFiles(data.pinnedPost.documents, campaignRef.id),
                data.pinnedPost.images && uploadPhotos(data.pinnedPost.images, campaignRef.id)])

            batch.set(campaignRef, data.campaign)
            const postRef = firestore().collection("campaigns").doc(campaignRef.id).collection("posts").doc()
            const documents = files?.map((value, index) => {
                return {
                    uri: value,
                    name: data.pinnedPost.documents!![index].name
                }})
            batch.set(postRef, {...data.pinnedPost, images: images, documents: documents, id: postRef.id})
            await batch.commit()
            return {...data.campaign, id: campaignRef.id} as CampaignModel
        }
    } else {
        throw Error("No internet connection")
    }
}

export const requestGetCampaigns = async (data: {
    charityID: string
}) => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {

        const snapshot = await firestore().collection("campaigns").where("parentcharity", "==", data.charityID).get()

        if (!snapshot.empty) {
            return snapshot.docs.map(value => {
                return {...value.data(), id: value.id} as CampaignModel
            })
        } else {
            return []
        }
    } else {
        throw Error("No internet connection")
    }
}

export const getPostsRequest = async (data: { campaignID: string }) => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
        const formatter = new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'});
        const snapshot = await firestore().collection("campaigns").doc(data.campaignID).collection("posts")
            .orderBy("date", "desc")
            .get()
        if (!snapshot.empty) {
            return snapshot.docs.map(value => {
                return {...value.data(), date: formatter.format(value.data().date.toDate())} as PostRemoteModel
            })
        } else {
            return []
        }
    } else {
        throw Error("No internet connection")
    }
}