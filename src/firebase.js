import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyBFHrhBx6Jto_tfwfLY0prKT3uSt2rlsHk',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'book-review-journal-f5363.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'book-review-journal-f5363',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'book-review-journal-f5363.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '648821151200',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:648821151200:web:39f367d9cddda0e445c785',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-FCFETKDJ7P',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.warn('Firebase initialization skipped:', err);
  }
}

export { auth, db, googleProvider };

/**
 * Sign in with Google via Firebase Auth (if configured)
 */
export async function loginWithGoogleFirebase() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error('Firebase env keys not configured yet.');
  }
  const cred = await signInWithPopup(auth, googleProvider);
  return {
    uid: cred.user.uid,
    email: cred.user.email,
    name: cred.user.displayName || cred.user.email?.split('@')[0] || 'Reader',
    provider: 'google',
  };
}

/**
 * Sign in or Sign up with Email & Password (uses Firebase Auth when configured, or local fallback)
 */
export async function authenticateEmailUser(email, password, isSignup = false, displayName = '') {
  if (isFirebaseConfigured && auth) {
    const cred = isSignup
      ? await createUserWithEmailAndPassword(auth, email, password)
      : await signInWithEmailAndPassword(auth, email, password);
    return {
      uid: cred.user.uid,
      email: cred.user.email,
      name: displayName || cred.user.displayName || cred.user.email?.split('@')[0] || 'Reader',
      provider: 'firebase-email',
    };
  }
  return null;
}

/**
 * Sign out from Firebase Auth
 */
export async function logoutFirebaseUser() {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn(e);
    }
  }
}

/**
 * Load user's journal data (savedReviews + quoteScore + wishlist) from Firestore
 */
export async function loadUserJournalFromCloud(uid) {
  if (!isFirebaseConfigured || !db || !uid || uid === 'guest_local') return null;
  try {
    const snap = await getDoc(doc(db, 'journals', uid));
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn('Firestore read fallback to localStorage:', err);
  }
  return null;
}

/**
 * Save user's journal data (savedReviews capped at 17 + quoteScore) to Firestore
 */
export async function saveUserJournalToCloud(uid, payload) {
  if (!isFirebaseConfigured || !db || !uid || uid === 'guest_local') return;
  try {
    await setDoc(
      doc(db, 'journals', uid),
      {
        ...payload,
        updatedAtIso: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore write fallback to localStorage:', err);
  }
}
