import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim() || "";
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || "";
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || "";
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || "";
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || "";
const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim() || "";

const firebaseConfig = {
  apiKey: apiKey || "AIzaSyDummyKeyForVisvamHarvest2026",
  authDomain: authDomain || "visvam-harvest.firebaseapp.com",
  projectId: projectId || "visvam-harvest",
  storageBucket: storageBucket || "visvam-harvest.appspot.com",
  messagingSenderId: messagingSenderId || "1029384756",
  appId: appId || "1:1029384756:web:abcdef123456",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  User,
};

export async function getIdToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return await currentUser.getIdToken();
}
