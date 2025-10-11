# 🚀 Configuration de l'API Stripe - Guide complet

## ✅ Ce qui a été créé

### 1. API Serverless Functions

Deux endpoints ont été créés dans le dossier `/api` :

#### 📝 `/api/create-checkout-session.js`
- Crée une session Stripe Checkout
- Gère les paiements mensuels et annuels
- Redirige vers Stripe pour le paiement sécurisé

#### 🔔 `/api/webhook.js`
- Reçoit les événements de paiement de Stripe
- Met à jour automatiquement les abonnements dans Firestore
- Gère les paiements réussis, échoués, et les annulations

### 2. Configuration requise

## 🔐 Variables d'environnement Vercel

Vous devez configurer ces variables dans Vercel (Settings > Environment Variables) :

### Variables Firebase (déjà configurées)
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### Variables Firebase Admin (nouvelles - requises pour le webhook)
```
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@instaquizz-firebase.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Pour obtenir ces credentials :**
1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet `instaquizz-firebase`
3. Paramètres du projet > Comptes de service
4. Générer une nouvelle clé privée
5. Copiez `client_email` et `private_key` du fichier JSON

### Variables Stripe (nouvelles)
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (déjà configuré)
STRIPE_SECRET_KEY=sk_test_... (à ajouter)
STRIPE_WEBHOOK_SECRET=whsec_... (à créer - voir ci-dessous)
```

### Variable App URL
```
VITE_APP_URL=https://instaquizz.vercel.app
```

## 🔧 Configuration du Webhook Stripe

### Étape 1 : Déployer l'application sur Vercel

```bash
cd instaquizz
vercel --prod
```

### Étape 2 : Configurer le webhook sur Stripe Dashboard

1. Allez sur [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez sur "Ajouter un endpoint"
3. URL du endpoint : `https://instaquizz.vercel.app/api/webhook`
4. Sélectionnez les événements à écouter :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Cliquez sur "Ajouter un endpoint"
6. **Copiez le "Signing secret"** (commence par `whsec_`)
7. Ajoutez-le dans Vercel comme `STRIPE_WEBHOOK_SECRET`

### Étape 3 : Tester le webhook

Utilisez la Stripe CLI pour tester localement :

```bash
# Installer Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Rediriger les webhooks vers votre endpoint local
stripe listen --forward-to localhost:3000/api/webhook

# Dans un autre terminal, déclencher un événement de test
stripe trigger checkout.session.completed
```

## 📋 Checklist de déploiement

- [ ] Créer les credentials Firebase Admin
- [ ] Ajouter `FIREBASE_CLIENT_EMAIL` dans Vercel
- [ ] Ajouter `FIREBASE_PRIVATE_KEY` dans Vercel
- [ ] Ajouter `STRIPE_SECRET_KEY` dans Vercel
- [ ] Déployer sur Vercel avec `vercel --prod`
- [ ] Configurer le webhook sur Stripe Dashboard
- [ ] Ajouter `STRIPE_WEBHOOK_SECRET` dans Vercel
- [ ] Re-déployer après ajout des variables
- [ ] Tester un paiement de test

## 🧪 Tester les paiements

### Cartes de test Stripe

**Paiement réussi :**
```
Numéro: 4242 4242 4242 4242
Date: n'importe quelle date future
CVC: n'importe quel 3 chiffres
```

**Paiement nécessitant une authentification :**
```
Numéro: 4000 0025 0000 3155
```

**Paiement refusé :**
```
Numéro: 4000 0000 0000 9995
```

### Test du flux complet

1. Allez sur `/subscription`
2. Choisissez un plan (par exemple Pro à 0,90€)
3. Cliquez sur "Choisir ce plan"
4. Vous serez redirigé vers Stripe Checkout
5. Utilisez une carte de test
6. Après le paiement, vous serez redirigé vers l'application
7. Vérifiez que votre abonnement est bien mis à jour

## 🐛 Dépannage

### Erreur 405 sur /api/create-checkout-session
- Vérifiez que les variables d'environnement sont bien configurées dans Vercel
- Re-déployez l'application après avoir ajouté les variables

### Webhook ne reçoit pas les événements
- Vérifiez l'URL du webhook sur Stripe Dashboard
- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
- Regardez les logs du webhook dans Stripe Dashboard

### L'abonnement n'est pas mis à jour dans Firestore
- Vérifiez les logs du webhook dans Vercel
- Vérifiez que les credentials Firebase Admin sont corrects
- Vérifiez les règles de sécurité Firestore

## 📚 Ressources

- [Documentation Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Documentation Webhooks Stripe](https://stripe.com/docs/webhooks)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

## 🎯 Prochaines étapes

1. Configurer les variables d'environnement dans Vercel
2. Déployer l'application
3. Configurer le webhook Stripe
4. Tester avec les cartes de test
5. Passer en production avec les vraies clés Stripe

Tout est prêt pour accepter des paiements ! 🎉

