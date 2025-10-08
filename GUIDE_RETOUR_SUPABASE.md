# 🔄 Guide de Retour Temporaire à Supabase

## 🎯 **Situation Actuelle**

- ✅ **Firebase configuré** mais **collections vides**
- ✅ **Supabase installé** et prêt à être utilisé
- ✅ **Code modifié** pour utiliser Supabase temporairement
- ✅ **App.tsx sauvegardé** (App.firebase.tsx) pour revenir à Firebase plus tard

## 📋 **Configuration Supabase**

### 1. **Récupérer vos identifiants Supabase**

Si vous avez encore accès à votre projet Supabase :
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet InstaQuizz
4. Allez dans **Settings** > **API**
5. Copiez :
   - **Project URL** (ex: `https://abcdefgh.supabase.co`)
   - **anon public** key (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 2. **Créer le fichier de configuration**

Créez un fichier `.env.local` à la racine du projet :

```env
# Configuration Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon

# Gardez aussi Firebase au cas où
VITE_FIREBASE_API_KEY=AIzaSyB7-oLur0acq5zF3zwm97nH7NmjHAtgT8A
VITE_FIREBASE_AUTH_DOMAIN=instaquizz-firebase.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=instaquizz-firebase
VITE_FIREBASE_STORAGE_BUCKET=instaquizz-firebase.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=973474612549
VITE_FIREBASE_APP_ID=1:973474612549:web:292407d80d568e770d2a2c
```

### 3. **Vérifier la structure de la base de données**

Dans Supabase, vérifiez que ces tables existent :
- `teachers` (ou `userProfiles`)
- `classes`
- `students`
- `questions`
- `quiz_results`

## 🚀 **Test de l'Application**

### 1. **Démarrer l'application**
```bash
npm run dev
```

### 2. **Tester la connexion**
1. Ouvrez l'application dans votre navigateur
2. Essayez de vous connecter avec vos identifiants Supabase
3. Vérifiez que vos données apparaissent

### 3. **Vérifier les fonctionnalités**
- ✅ Connexion/Déconnexion
- ✅ Affichage des classes
- ✅ Affichage des questions
- ✅ Statistiques
- ✅ Quiz

## 🔧 **En cas de Problème**

### **Erreur de connexion Supabase**
```bash
# Vérifiez que Supabase est bien installé
npm list @supabase/supabase-js

# Si pas installé, réinstallez
npm install @supabase/supabase-js
```

### **Données manquantes**
- Vérifiez que vos tables Supabase contiennent des données
- Vérifiez les noms des tables (peuvent différer de Firebase)

### **Erreurs de permissions**
- Vérifiez les politiques RLS dans Supabase
- Assurez-vous que l'authentification fonctionne

## 🔄 **Retour à Firebase (quand vous voulez)**

### **Option 1 : Restaurer la version Firebase**
```bash
# Renommer les fichiers
mv src/App.tsx src/App.supabase.tsx
mv src/App.firebase.tsx src/App.tsx

# Redémarrer l'application
npm run dev
```

### **Option 2 : Script automatique**
```bash
node switch-to-firebase.js
```

## 📊 **Comparaison des Solutions**

| Aspect | Supabase | Firebase |
|--------|----------|----------|
| **Données existantes** | ✅ Vos données | ❌ Vide |
| **Configuration** | ✅ Simple | ⚠️ Complexe |
| **Performance** | ✅ Bonne | ✅ Excellente |
| **Coûts** | ⚠️ Limité | ✅ Généreux |
| **Stabilité** | ⚠️ Pause auto | ✅ Stable |

## 🎯 **Recommandation**

**Utilisez Supabase temporairement** car :
1. ✅ **Vos données sont là**
2. ✅ **Configuration simple**
3. ✅ **Application fonctionnelle immédiatement**

**Puis migrez vers Firebase** quand vous voulez :
1. 🔄 **Exportez vos données Supabase**
2. 🔄 **Importez dans Firebase**
3. 🔄 **Basculez l'application**

## 🆘 **Support**

Si vous rencontrez des problèmes :
1. Vérifiez la console du navigateur
2. Vérifiez les logs Supabase
3. Vérifiez vos variables d'environnement
4. Testez avec un compte de test

**Votre application devrait maintenant fonctionner avec vos données Supabase !** 🎉


