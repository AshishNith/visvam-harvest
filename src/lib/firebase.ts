import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  type User,
  type ConfirmationResult,
} from "firebase/auth";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim() || "";
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || "";
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || "";
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || "";
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || "";
const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim() || "";
const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim() || "";

const firebaseConfig = {
  apiKey: apiKey || "AIzaSyAsOXcpbOtJ9jwvasK3a3Cqtw98LWJBkG0",
  authDomain: authDomain || "visvam-1be38.firebaseapp.com",
  projectId: projectId || "visvam-1be38",
  storageBucket: storageBucket || "visvam-1be38.firebasestorage.app",
  messagingSenderId: messagingSenderId || "495648080259",
  appId: appId || "1:495648080259:web:505eca258f514f76c076b6",
  measurementId: measurementId || "G-Y0DY3H247Z",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// In local development, bypass reCAPTCHA app verification for test phone numbers
if (typeof window !== "undefined") {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.") ||
    window.location.hostname.endsWith(".local");
  if (isLocal && import.meta.env.DEV) {
    try {
      auth.settings.appVerificationDisabledForTesting = true;
    } catch {}
  }
}

export const googleProvider = new GoogleAuthProvider();

// Action code settings for email link sign-in
export const emailLinkActionCodeSettings = {
  // URL to redirect back to after email link click
  url: typeof window !== "undefined" ? window.location.origin + "/" : "https://visvam.in/",
  handleCodeInApp: true,
};

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  User,
  ConfirmationResult,
};

export async function getIdToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return await currentUser.getIdToken();
}
