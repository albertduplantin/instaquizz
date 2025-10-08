import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Configuration Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB7-oLur0acq5zF3zwm97nH7NmjHAtgT8A",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "instaquizz-firebase.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "instaquizz-firebase",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "instaquizz-firebase.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "973474612549",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:973474612549:web:292407d80d568e770d2a2c"
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)

// Exporter les services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app