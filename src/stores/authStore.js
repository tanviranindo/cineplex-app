import { create } from 'zustand'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../services/firebase'

async function ensureUserDoc(fbUser) {
  const ref = doc(db, 'users', fbUser.uid, 'preferences', 'settings')
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      watchlistTab: 'all',
      watchlistSort: 'added',
      searchHistory: [],
      recentlyViewed: [],
      createdAt: serverTimestamp(),
    })
  }
  const themeRef = doc(db, 'users', fbUser.uid, 'preferences', 'theme')
  const themeSnap = await getDoc(themeRef)
  if (!themeSnap.exists()) {
    await setDoc(themeRef, { value: 'dark' })
  }
}

export const useAuthStore = create((set, get) => ({
  user: null,
  authReady: false,

  initAuth: () => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        set({
          authReady: true,
          user: {
            id: fbUser.uid,
            name: fbUser.displayName,
            email: fbUser.email,
            photoURL: fbUser.photoURL,
            providerId: fbUser.providerData[0]?.providerId,
          },
        })
        // Fire-and-forget: ensure Firestore user docs exist (first login / signup)
        // Not awaited — must not block the auth callback
        ensureUserDoc(fbUser).catch((e) => {
          console.warn('[auth] Failed to ensure user doc:', e.message)
        })
      } else {
        set({ authReady: true, user: null })
      }
    })
    return unsub
  },

  signup: async (name, email, password) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      return { ok: true }
    } catch (e) { return { ok: false, error: mapAuthError(e.code) } }
  },

  login: async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { ok: true }
    } catch (e) { return { ok: false, error: mapAuthError(e.code) } }
  },

  loginWithGoogle: async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      return { ok: true }
    } catch (e) { return { ok: false, error: mapAuthError(e.code) } }
  },

  logout: async () => { await signOut(auth) },

  sendPasswordReset: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { ok: true }
    } catch (e) { return { ok: false, error: mapAuthError(e.code) } }
  },

  updateDisplayName: async (name) => {
    await updateProfile(auth.currentUser, { displayName: name })
    set((s) => ({ user: { ...s.user, name } }))
  },

  updateUserPassword: async (currentPassword, newPassword) => {
    const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPassword)
    await reauthenticateWithCredential(auth.currentUser, cred)
    await updatePassword(auth.currentUser, newPassword)
  },

  deleteAccount: async (currentPassword) => {
    const { user } = get()
    if (user.providerId === 'google.com') {
      await reauthenticateWithPopup(auth.currentUser, googleProvider)
    } else {
      const cred = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(auth.currentUser, cred)
    }
    await deleteUser(auth.currentUser)
  },
}))

const AUTH_ERRORS = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
  'auth/popup-closed-by-user': 'Sign-in cancelled.',
  'auth/requires-recent-login': 'Please sign out and sign in again to do this.',
  'auth/network-request-failed': 'Network error. Check your connection.',
}
const mapAuthError = (code) => AUTH_ERRORS[code] ?? 'Something went wrong.'
