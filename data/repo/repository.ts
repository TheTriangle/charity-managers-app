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
import QuerySnapshot = firebase.firestore.QuerySnapshot;
import DocumentSnapshot = firebase.firestore.DocumentSnapshot;
import {CommentModel} from "../model/CommentModel";

let repoFirestore = firestore()

const TIMEOUT_MILLIS = 10000

const formatter = new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'});

export const userExists = async (
    email: string,
) => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
        const timeoutPromise = new Promise<string[]>((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out"))
            }, TIMEOUT_MILLIS)
        })
        const methodsPromise = auth.fetchSignInMethodsForEmail(email)
        const methods = await Promise.race([timeoutPromise, methodsPromise])
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
    } else {
        throw Error("No internet connection")
    }
}

export const hasManagerAccount = async () => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
        const timeoutPromise = new Promise<DocumentSnapshot>((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out"))
            }, TIMEOUT_MILLIS)
        })
        const existsPromise = firestore().collection("users").doc(auth.currentUser?.uid).get()
        const doc = await Promise.race([timeoutPromise, existsPromise])
        if (doc.exists) {
            const data = doc.data()
            return data!.hasOwnProperty("managerName")
        } else {
            return false
        }
    } else {
        throw Error("No internet connection")
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
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out"));
            }, TIMEOUT_MILLIS)
        });

        const doc = firestore().collection("users").doc(auth.currentUser?.uid)
        const updatePromise = doc.update(managerData)
        await Promise.race([updatePromise, timeoutPromise]);
    } else {
        throw Error("No internet connection")
    }
}

export const getAllCharities = async (uid: string) => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
        const timeoutPromise = new Promise<QuerySnapshot>((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out"));
            }, TIMEOUT_MILLIS)
        });
        const getPromise = repoFirestore.collection("charities").where("creatorid", "==", uid).get()

        const docs = await Promise.race([getPromise, timeoutPromise]);
        if (!docs.empty) {
            return docs.docs.map(value => value.data() as CharityModel)
        } else {
            return []
        }
    } else {
        throw Error("No internet connection")
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
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out"))
            }, TIMEOUT_MILLIS)
        });

        const updatePromise = firestore().collection("charities").doc(data.id).update(data);

        await Promise.race([updatePromise, timeoutPromise]);
    } else {
        throw Error("No internet connection")
    }
}

export const deleteCharity = async (charityId: string) => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out"))
            }, TIMEOUT_MILLIS)
        });

        const deletePromise = firestore()
            .collection("charities").doc(charityId)
            .update({requestedDeletion: true});

        await Promise.race([deletePromise, timeoutPromise]);
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
        const timeoutPromise = new Promise<[string[] | undefined, string[] | undefined]>((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out"))
            }, 15000)
        });
        const postRef = firestore().collection("campaigns").doc(data.campaignID).collection("posts").doc()
        const filesImagesPromise = Promise.all([data.post.documents && uploadFiles(data.post.documents, data.campaignID),
            data.post.images && uploadPhotos(data.post.images, data.campaignID)])
        const [files, images] = await Promise.race([filesImagesPromise, timeoutPromise])

        const documents = files?.map((value, index) => {
            return {
                uri: value,
                name: data.post.documents!![index].name
            }
        })
        const createPostPromise = postRef.set({...data.post, images: images, documents: documents})
        const postTimeoutPromise = new Promise<[string[] | undefined, string[] | undefined]>((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out"))
            }, TIMEOUT_MILLIS)
        });
        await Promise.race([postTimeoutPromise, createPostPromise])

        const post = await postRef.get()
        return {...post.data(), date: formatter.format(post.data()!!.date.toDate())} as PostRemoteModel
    } else {
        throw Error("No internet connection")
    }
}

export const requestGetPaymentConfirmation = async (campaignID: string) => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
        const timeoutPromise = new Promise<DocumentSnapshot>((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out"))
            }, 10000)
        });
        const campaignPromise = firestore().collection("campaigns").doc(campaignID).get()
        const campaignDoc = await Promise.race([campaignPromise, timeoutPromise])
        if (campaignDoc.exists) {
            if (campaignDoc.data()!.confirmednotifications === undefined) {
                return false
            }
            return campaignDoc.data()!.confirmednotifications as boolean
        } else {
            throw Error("No campaign found")
        }
    } else {
        throw Error("No internet connection")
    }
}

export const requestCreateCampaign = async (data: {
    documentID: string
    campaign: CampaignModel
    pinnedPost: PostLocalModel
}) => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
        const timeoutPromise = new Promise<[string[] | undefined, string[] | undefined]>((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out"))
            }, 15000)
        });
        const batch = firestore().batch()

        const campaignRef = firestore().collection("campaigns").doc(data.documentID)
        const filesImagesPromise = Promise.all([data.pinnedPost.documents && uploadFiles(data.pinnedPost.documents, campaignRef.id),
            data.pinnedPost.images && uploadPhotos(data.pinnedPost.images, campaignRef.id)])

        const [files, images] = await Promise.race([timeoutPromise, filesImagesPromise])

        batch.update(campaignRef, data.campaign)
        const postRef = firestore().collection("campaigns").doc(campaignRef.id).collection("posts").doc()
        const documents = files?.map((value, index) => {
            return {
                uri: value,
                name: data.pinnedPost.documents!![index].name
            }
        })
        batch.set(postRef, {...data.pinnedPost, images: images, documents: documents, id: postRef.id})
        const batchTimeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out"))
            }, TIMEOUT_MILLIS)
        });
        await Promise.race([batchTimeoutPromise, batch.commit()])
        return {...data.campaign, id: campaignRef.id} as CampaignModel

    } else {
        throw Error("No internet connection")
    }
}

export const requestGetCampaigns = async (data: {
    charityID: string
}) => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
        const timeoutPromise = new Promise<QuerySnapshot>((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out"))
            }, TIMEOUT_MILLIS)
        });
        const snapshotPromise = firestore().collection("campaigns").where("parentcharity", "==", data.charityID).get()
        const snapshot = await Promise.race([timeoutPromise, snapshotPromise])
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
        const timeoutPromise = new Promise<QuerySnapshot>((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out"))
            }, TIMEOUT_MILLIS)
        });
        const snapshotPromise = firestore().collection("campaigns").doc(data.campaignID).collection("posts")
            .orderBy("date", "desc")
            .get()
        const snapshot = await Promise.race([timeoutPromise, snapshotPromise])
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

export const requestCreateComment = async (data: {
    campaignID: string
    postID: string
    comment: CommentModel
}) => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
        const timeoutPromise = new Promise<[string[] | undefined, string[] | undefined]>((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out"))
            }, 10000)
        });

        const commentPromise = firestore()
            .collection("campaigns")
            .doc(data.campaignID)
            .collection("posts")
            .doc(data.postID)
            .collection("comments")
            .add(data.comment)
        await Promise.race([timeoutPromise, commentPromise])
        return {...data.comment, date: formatter.format(new Date())}
    } else {
        throw Error("No internet connection")
    }
}

export const getCommentsRequest = async (data: { postID: string, campaignID: string }) => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
        const timeoutPromise = new Promise<QuerySnapshot>((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out"))
            }, TIMEOUT_MILLIS)
        });
        const formatter = new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'});
        const snapshotPromise = firestore()
            .collection("campaigns")
            .doc(data.campaignID)
            .collection("posts")
            .doc(data.postID)
            .collection("comments")
            .orderBy("date", "asc")
            .get()
        const snapshot = await Promise.race([timeoutPromise, snapshotPromise])
        if (!snapshot.empty) {
            return snapshot.docs.map(value => {
                return {...value.data(), date: formatter.format(value.data().date.toDate())} as CommentModel
            })
        } else {
            return []
        }
    } else {
        throw Error("No internet connection")
    }
}