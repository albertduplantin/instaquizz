# 📊 Statut des Variables d'Environnement Vercel

**Date de vérification :** 10 octobre 2025

## ✅ Variables configurées (16/19)

### Firebase (Frontend) - ✅ Complet
- ✅ `VITE_FIREBASE_API_KEY`
- ✅ `VITE_FIREBASE_AUTH_DOMAIN`
- ✅ `VITE_FIREBASE_PROJECT_ID`
- ✅ `VITE_FIREBASE_STORAGE_BUCKET`
- ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `VITE_FIREBASE_APP_ID`

### Stripe (Frontend + Backend) - ✅ Complet
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY`
- ✅ `STRIPE_SECRET_KEY` ✨ (ajouté il y a 30 jours)

### Application
- ✅ `VITE_APP_URL` ✨ (ajouté il y a 3 minutes)

### EmailJS (optionnel) - ✅ Complet
- ✅ `VITE_EMAILJS_SERVICE_ID`
- ✅ `VITE_EMAILJS_TEMPLATE_ID`
- ✅ `VITE_EMAILJS_PUBLIC_KEY`

### Supabase (ancienne config, non utilisée)
- ⚠️ `VITE_SUPABASE_URL` (peut être supprimé)
- ⚠️ `VITE_SUPABASE_ANON_KEY` (peut être supprimé)

## ❌ Variables MANQUANTES (3)

Ces variables sont **nécessaires** pour que le webhook fonctionne :

### 1. `FIREBASE_CLIENT_EMAIL`
- **Usage :** Authentification Firebase Admin pour le webhook
- **Format :** `firebase-adminsdk-xxxxx@instaquizz-firebase.iam.gserviceaccount.com`
- **Où l'obtenir :** Firebase Console > Paramètres du projet > Comptes de service > Générer une nouvelle clé privée

### 2. `FIREBASE_PRIVATE_KEY`
- **Usage :** Authentification Firebase Admin pour le webhook
- **Format :** `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
- **Où l'obtenir :** Même fichier JSON que FIREBASE_CLIENT_EMAIL
- **⚠️ Important :** Garder les guillemets et les `\n`

### 3. `STRIPE_WEBHOOK_SECRET`
- **Usage :** Vérification de l'authenticité des webhooks Stripe
- **Format :** `whsec_...`
- **Où l'obtenir :** Stripe Dashboard > Webhooks > Créer un endpoint
- **Note :** À créer APRÈS le déploiement de l'API

## ⚠️ Variables à nettoyer

### `VITE_STRIPE_SECRET_KEY`
- ❌ **PROBLÈME DE SÉCURITÉ** : La clé secrète Stripe ne doit JAMAIS être exposée côté client
- Le préfixe `VITE_` expose cette variable dans le bundle JavaScript public
- ✅ Utilisez `STRIPE_SECRET_KEY` (sans VITE_) à la place
- **Action recommandée :** Supprimer `VITE_STRIPE_SECRET_KEY`

### `NEXT_PUBLIC_APP_URL`
- ❓ Variable Next.js non utilisée (l'app est en React/Vite)
- **Action recommandée :** Peut être supprimée

## 🎯 État actuel du système

### ✅ Ce qui fonctionne
- Application frontend
- Authentification Firebase
- Affichage des plans d'abonnement
- Compression et upload d'images

### ⚠️ Ce qui ne fonctionne PAS encore
- ❌ Création de sessions Stripe Checkout → **Fonctionne** (API créée)
- ❌ Mise à jour automatique des abonnements après paiement → **Nécessite les 3 variables manquantes**

## 📋 Actions recommandées

### Priorité 1 : Tester les paiements (fonctionne déjà)
Les paiements fonctionnent sans les variables webhook. Les utilisateurs peuvent :
- Sélectionner un plan
- Être redirigés vers Stripe
- Effectuer un paiement

**Problème :** L'abonnement ne sera pas mis à jour automatiquement dans Firestore.

### Priorité 2 : Ajouter les variables webhook (pour la mise à jour automatique)
```bash
# 1. Obtenir les credentials Firebase Admin
# Aller sur Firebase Console

# 2. Ajouter les variables
vercel env add FIREBASE_CLIENT_EMAIL production
vercel env add FIREBASE_PRIVATE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production

# 3. Redéployer
vercel --prod
```

### Priorité 3 : Nettoyer les variables inutilisées
```bash
vercel env rm VITE_STRIPE_SECRET_KEY production
vercel env rm NEXT_PUBLIC_APP_URL production
vercel env rm VITE_SUPABASE_URL production
vercel env rm VITE_SUPABASE_ANON_KEY production
```

## 🧪 Test de validation

### Étape 1 : Tester le checkout (devrait fonctionner)
1. Aller sur https://instaquizz.vercel.app/#/subscription
2. Cliquer sur un plan
3. Vérifier la redirection vers Stripe ✅

### Étape 2 : Tester le webhook (après ajout des variables)
1. Effectuer un paiement de test
2. Vérifier que l'abonnement est mis à jour dans Firestore
3. Vérifier les logs du webhook dans Vercel

## 📚 Ressources

- **Guide complet :** `STRIPE_API_SETUP.md`
- **Guide rapide :** `DEPLOIEMENT_RAPIDE.md`
- **Commandes Vercel CLI :** `vercel env --help`

