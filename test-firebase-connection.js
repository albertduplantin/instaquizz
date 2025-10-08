// Script de test pour vérifier la connexion Firebase
import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyB7-oLur0acq5zF3zwm97nH7NmjHAtgT8A",
  authDomain: "instaquizz-firebase.firebaseapp.com",
  projectId: "instaquizz-firebase",
  storageBucket: "instaquizz-firebase.firebasestorage.app",
  messagingSenderId: "973474612549",
  appId: "1:973474612549:web:292407d80d568e770d2a2c"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function testFirebaseConnection() {
  console.log('🧪 Test de connexion Firebase...')
  
  try {
    // Test d'authentification anonyme
    console.log('1. Test d\'authentification...')
    const userCredential = await signInAnonymously(auth)
    console.log('✅ Authentification réussie:', userCredential.user.uid)
    
    // Test d'accès à Firestore
    console.log('2. Test d\'accès à Firestore...')
    const classesRef = collection(db, 'classes')
    const snapshot = await getDocs(classesRef)
    console.log('✅ Accès Firestore réussi. Classes trouvées:', snapshot.size)
    
    console.log('🎉 Tous les tests sont passés ! Firebase fonctionne correctement.')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
    
    if (error.code === 'permission-denied') {
      console.log('💡 Les règles Firestore bloquent l\'accès. Vérifiez les règles déployées.')
    } else if (error.code === 'unavailable') {
      console.log('💡 Service Firebase indisponible. Vérifiez votre connexion internet.')
    }
  }
}

testFirebaseConnection()


