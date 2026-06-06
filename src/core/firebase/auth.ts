import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  const { uid, displayName, email, photoURL } = result.user
  await setDoc(
    doc(db, 'users', uid),
    { id: uid, name: displayName, email, photoURL, updatedAt: serverTimestamp() },
    { merge: true },
  )
  return result.user
}

export async function signOut() {
  await firebaseSignOut(auth)
}
