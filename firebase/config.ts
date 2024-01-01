import {getFirestore, doc, setDoc, getDoc, deleteDoc, collection} from "firebase/firestore";
import 'firebase/compat/auth';
import firebase from 'firebase/compat/app';
import {firebaseConfig} from "./secrets";
import { GoogleAuthProvider } from "firebase/auth";

const app = firebase.apps.length === 0 ? firebase.initializeApp(firebaseConfig) : firebase.app()
const auth = firebase.auth()
const db = getFirestore(app)

export {auth, app, db, getFirestore, doc, setDoc, getDoc, deleteDoc, collection}