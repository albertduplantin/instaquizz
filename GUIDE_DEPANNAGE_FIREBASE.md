# Guide de Dépannage - Erreurs de Permissions Firebase

## Problème Identifié
Votre application InstaQuizz rencontre des erreurs "Missing or insufficient permissions" dans la console du navigateur, empêchant le bon fonctionnement de l'application.

## Solutions

### 1. Déployer les Règles Firestore (Recommandé)

#### Option A: Automatique (avec Firebase CLI)
```bash
# Installer Firebase CLI si pas déjà fait
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Déployer les règles
node deploy-firestore-rules.js
```

#### Option B: Manuel
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet `instaquizz-firebase`
3. Allez dans **Firestore Database** > **Règles**
4. Copiez le contenu du fichier `firestore.rules`
5. Collez-le dans l'éditeur de règles
6. Cliquez sur **"Publier"**

### 2. Vérifier la Configuration Firebase

Assurez-vous que votre fichier `.env` contient les bonnes clés :
```env
VITE_FIREBASE_API_KEY=AIzaSyB7-oLur0acq5zF3zwm97nH7NmjHAtgT8A
VITE_FIREBASE_AUTH_DOMAIN=instaquizz-firebase.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=instaquizz-firebase
VITE_FIREBASE_STORAGE_BUCKET=instaquizz-firebase.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=973474612549
VITE_FIREBASE_APP_ID=1:973474612549:web:292407d80d568e770d2a2c
```

### 3. Vérifier l'Authentification

1. Ouvrez la console du navigateur
2. Vérifiez que l'utilisateur est bien authentifié :
```javascript
// Dans la console du navigateur
console.log('Utilisateur connecté:', firebase.auth().currentUser);
```

### 4. Tester les Règles Firestore

Après avoir déployé les règles, testez-les dans la console Firebase :
1. Allez dans **Firestore Database** > **Règles**
2. Cliquez sur **"Simulateur"**
3. Testez les opérations de lecture/écriture

### 5. Vérifier les Collections

Assurez-vous que les collections suivantes existent dans Firestore :
- `userProfiles`
- `classes`
- `students`
- `questions`
- `quiz_results`

## Règles Firestore Déployées

Les règles suivantes ont été configurées :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Profils utilisateur - accès uniquement à son propre profil
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Classes - accès uniquement aux classes de l'enseignant connecté
    match /classes/{classId} {
      allow read, write: if request.auth != null && 
        (resource.data.teacher_id == request.auth.uid || 
         request.resource.data.teacher_id == request.auth.uid);
    }
    
    // Étudiants - accès via les classes de l'enseignant
    match /students/{studentId} {
      allow read, write: if request.auth != null && 
        (resource.data.class_id != null && 
         exists(/databases/$(database)/documents/classes/$(resource.data.class_id)) &&
         get(/databases/$(database)/documents/classes/$(resource.data.class_id)).data.teacher_id == request.auth.uid) ||
        (request.resource.data.class_id != null && 
         exists(/databases/$(database)/documents/classes/$(request.resource.data.class_id)) &&
         get(/databases/$(database)/documents/classes/$(request.resource.data.class_id)).data.teacher_id == request.auth.uid);
    }
    
    // Questions - accès uniquement aux questions de l'enseignant connecté
    match /questions/{questionId} {
      allow read, write: if request.auth != null && 
        (resource.data.teacher_id == request.auth.uid || 
         request.resource.data.teacher_id == request.auth.uid);
    }
    
    // Résultats de quiz - accès uniquement aux résultats de l'enseignant connecté
    match /quiz_results/{resultId} {
      allow read, write: if request.auth != null && 
        (resource.data.teacher_id == request.auth.uid || 
         request.resource.data.teacher_id == request.auth.uid);
    }
  }
}
```

## Améliorations Apportées

1. **Gestion d'erreurs améliorée** - Les services gèrent maintenant les erreurs de permissions de manière gracieuse
2. **Règles Firestore sécurisées** - Accès restreint aux données de chaque utilisateur
3. **Fallbacks appropriés** - L'application continue de fonctionner même en cas d'erreur de permissions

## Test de la Solution

1. Déployez les règles Firestore
2. Rechargez l'application
3. Connectez-vous avec un compte utilisateur
4. Vérifiez que les erreurs de permissions ont disparu de la console
5. Testez les fonctionnalités principales (créer une classe, ajouter des questions, etc.)

## Support

Si les problèmes persistent après avoir suivi ce guide, vérifiez :
- Que votre projet Firebase est correctement configuré
- Que l'authentification fonctionne correctement
- Que les collections Firestore existent
- Que les règles ont été déployées avec succès


