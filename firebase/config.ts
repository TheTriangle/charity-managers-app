import {getFirestore, doc, setDoc, getDoc, deleteDoc, collection} from "firebase/firestore";
import 'firebase/compat/auth';
import firebase from 'firebase/compat/app';
import {firebaseConfig} from "./secrets";
import {getReactNativePersistence, initializeAuth} from "firebase/auth"
import AsyncStorage from "@react-native-async-storage/async-storage";

const app = firebase.apps.length === 0 ? firebase.initializeApp(firebaseConfig) : firebase.app()
initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
const auth = firebase.auth()
const db = getFirestore(app)

export {auth, app, db, getFirestore, doc, setDoc, getDoc, deleteDoc, collection}