import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "./firebase";

// Only initialize auth if app is available (client-side)
export const auth = app ? getAuth(app) : null;
export const provider = new GoogleAuthProvider();

export function signInWithGoogle() {
  if (!auth) {
    throw new Error('Firebase auth not initialized');
  }
  return signInWithPopup(auth, provider);
}

export const waitForIdToken = async (maxRetries = 10, delay = 500): Promise<string | null> => {
  if (!auth) {
    console.error("❌ Firebase auth not initialized");
    return null;
  }
  
  let retries = 0
  while (retries < maxRetries) {
    const user = auth.currentUser
    if (user) {
      try {
        const idToken = await user.getIdToken()
        return idToken
      } catch (err) {
        console.warn("🚧 Failed to get token, retrying...", err)
      }
    }
    await new Promise((res) => setTimeout(res, delay))
    retries++
  }
  console.error("❌ Failed to get idToken after retries")
  return null
}