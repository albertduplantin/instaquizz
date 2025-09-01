# 🔥 Migration de Supabase vers Firebase

## Pourquoi migrer ?

Supabase met en pause les projets gratuits après une période d'inactivité. Firebase offre un plan gratuit plus généreux et stable.

## 📋 Étapes de migration

### 1. Créer un projet Firebase

1. **Allez sur [firebase.google.com](https://firebase.google.com)**
2. **Cliquez sur "Créer un projet"**
3. **Nommez-le** (ex: "instaquizz-firebase")
4. **Activez Google Analytics** (gratuit)
5. **Créez le projet**

### 2. Configurer l'authentification

1. **Dans Firebase Console :** `Authentication` > `Get started`
2. **Activez :** `Email/Password` et `Google`
3. **Cliquez sur "Save"**

### 3. Créer la base de données Firestore

1. **Dans Firebase Console :** `Firestore Database` > `Create database`
2. **Mode :** `Start in test mode` (pour commencer)
3. **Région :** `europe-west3` (Paris) pour de meilleures performances

### 4. Récupérer la configuration

1. **Dans Firebase Console :** `Project Settings` (roue dentée)
2. **Onglet "General"**
3. **Section "Your apps"** > `</>` (Web app)
4. **Nommez l'app** (ex: "instaquizz-web")
5. **Copiez la configuration :**

```javascript
const firebaseConfig = {
  apiKey: "votre_api_key",
  authDomain: "votre_projet.firebaseapp.com",
  projectId: "votre_projet_id",
  storageBucket: "votre_projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
}
```

### 5. Configurer les variables d'environnement

Créez un fichier `.env.local` dans votre projet :

```bash
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
VITE_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 6. Configurer Vercel

1. **Allez sur [vercel.com](https://vercel.com)**
2. **Sélectionnez votre projet `instaquizz`**
3. **Settings** > `Environment Variables`
4. **Ajoutez toutes les variables Firebase ci-dessus**
5. **Redéployez le projet**

## 🗄️ Structure de la base de données

Firebase créera automatiquement ces collections :

- `teachers` - Profils des enseignants
- `classes` - Classes créées
- `students` - Élèves par classe
- `questions` - Questions par classe
- `quiz_results` - Résultats des quiz

## ✅ Avantages de Firebase

- **Plan gratuit généreux :** 50,000 lectures/jour, 20,000 écritures/jour
- **Pas de pause automatique** des projets
- **Performance excellente** avec CDN global
- **Intégration Google** native
- **Analytics gratuits** inclus

## 🚀 Après la migration

1. **Testez l'application** localement avec `npm run dev`
2. **Vérifiez l'authentification** (inscription/connexion)
3. **Créez une classe** de test
4. **Ajoutez des élèves** et des questions
5. **Testez le quiz**
6. **Déployez sur Vercel**

## 🔧 En cas de problème

- **Vérifiez les variables d'environnement**
- **Regardez la console du navigateur** pour les erreurs
- **Vérifiez les règles Firestore** (démarrez en mode test)
- **Consultez la [documentation Firebase](https://firebase.google.com/docs)**

## 📊 Comparaison des coûts

| Service | Plan Gratuit | Limites |
|---------|--------------|---------|
| **Supabase** | 500MB DB, 2GB transfert | Pause après inactivité |
| **Firebase** | 1GB DB, 50K lectures/jour | Stable, pas de pause |

Firebase est clairement le choix le plus stable pour un projet en production ! 🎯
