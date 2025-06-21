import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "./firebase";

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

export function getToken() {
  return auth.currentUser ? auth.currentUser.getIdToken() : Promise.reject("No user signed in");
}
