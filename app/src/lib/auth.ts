import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "./firebase";

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

export const waitForIdToken = async (maxRetries = 10, delay = 500): Promise<string | null> => {
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