# 🚀 Déploiement Rapide - API Stripe

## ⚡ Actions immédiates nécessaires

L'API `/api/create-checkout-session` a été créée mais nécessite des variables d'environnement pour fonctionner.

### 1️⃣ Ajouter les variables dans Vercel (URGENT)

Allez sur [Vercel Dashboard](https://vercel.com/dashboard) > Votre projet > Settings > Environment Variables

**Variables à ajouter :**

```
STRIPE_SECRET_KEY=sk_test_51P9yDLRroRfv8dBgxxx (votre clé Stripe secrète)
VITE_APP_URL=https://instaquizz.vercel.app
```

### 2️⃣ Obtenir votre clé secrète Stripe

1. Allez sur [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copiez la **clé secrète** (commence par `sk_test_`)
3. Collez-la dans Vercel comme `STRIPE_SECRET_KEY`

### 3️⃣ Redéployer

```bash
cd d:\Documents\aiprojets\Instaquizz\instaquizz
vercel --prod
```

Ou utilisez le bouton "Redeploy" dans Vercel Dashboard.

### 4️⃣ Tester

1. Allez sur https://instaquizz.vercel.app/#/subscription
2. Cliquez sur un plan
3. Vous devriez être redirigé vers Stripe Checkout ✅

## 🔔 Configuration du Webhook (optionnel mais recommandé)

Pour que les abonnements soient automatiquement mis à jour dans Firestore :

### Étape A : Obtenir les credentials Firebase Admin

1. [Firebase Console](https://console.firebase.google.com) > instaquizz-firebase
2. Paramètres > Comptes de service
3. "Générer une nouvelle clé privée"
4. Ouvrez le fichier JSON téléchargé

### Étape B : Ajouter dans Vercel

```
FIREBASE_CLIENT_EMAIL=(copiez "client_email" du JSON)
FIREBASE_PRIVATE_KEY=(copiez "private_key" du JSON - avec les \n)
```

### Étape C : Configurer le webhook Stripe

1. [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. "Ajouter un endpoint"
3. URL : `https://instaquizz.vercel.app/api/webhook`
4. Événements : 
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
5. Copiez le **Signing secret** (`whsec_...`)
6. Ajoutez-le dans Vercel : `STRIPE_WEBHOOK_SECRET=whsec_...`

### Étape D : Redéployer

```bash
vercel --prod
```

## ✅ C'est tout !

Les paiements devraient maintenant fonctionner correctement.

## 🧪 Test rapide

**Carte de test Stripe :**
- Numéro : `4242 4242 4242 4242`
- Date : n'importe quelle date future
- CVC : `123`

---

**Besoin d'aide ?** Consultez `STRIPE_API_SETUP.md` pour le guide complet.

