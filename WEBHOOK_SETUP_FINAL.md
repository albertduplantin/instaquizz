# 🎯 Configuration Finale du Webhook Stripe

## ✅ Statut actuel

### Variables configurées
- ✅ `FIREBASE_CLIENT_EMAIL` (ajoutée)
- ✅ `FIREBASE_PRIVATE_KEY` (ajoutée)
- ⏳ `STRIPE_WEBHOOK_SECRET` (à ajouter après création du webhook)

## 🚀 Étapes finales

### Étape 1 : Redéployer l'application

Les variables Firebase Admin viennent d'être ajoutées. Il faut redéployer pour les activer :

```powershell
vercel --prod
```

### Étape 2 : Créer le webhook sur Stripe

1. **Allez sur** : https://dashboard.stripe.com/test/webhooks

2. **Cliquez sur** : "Ajouter un endpoint" / "Add endpoint"

3. **URL du endpoint** :
   ```
   https://instaquizz.vercel.app/api/webhook
   ```

4. **Sélectionnez ces événements** :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. **Cliquez sur** : "Ajouter un endpoint" / "Add endpoint"

6. **Copiez le "Signing secret"** (commence par `whsec_...`)

### Étape 3 : Ajouter le Webhook Secret dans Vercel

Une fois que vous avez le `whsec_...`, exécutez :

```powershell
vercel env add STRIPE_WEBHOOK_SECRET production
# Collez votre whsec_... quand demandé
```

### Étape 4 : Redéployer une dernière fois

```powershell
vercel --prod
```

## 🧪 Test complet

### 1. Effectuer un paiement de test

1. Allez sur https://instaquizz.vercel.app/#/subscription
2. Choisissez le plan **Enterprise** (0,05€ - le moins cher)
3. Utilisez la carte de test : `4242 4242 4242 4242`
4. Complétez le paiement

### 2. Vérifier le webhook

1. Allez sur https://dashboard.stripe.com/test/webhooks
2. Cliquez sur votre webhook
3. Regardez l'onglet "Événements" / "Events"
4. Vous devriez voir `checkout.session.completed` avec un ✅

### 3. Vérifier Firebase

1. Allez sur https://console.firebase.google.com
2. Firestore Database > Collection `subscriptions`
3. Vous devriez voir votre abonnement mis à jour avec :
   - `plan: 'enterprise'`
   - `status: 'active'`
   - `stripeSubscriptionId: 'sub_...'`

### 4. Vérifier dans l'application

1. Rafraîchissez https://instaquizz.vercel.app/#/subscription
2. Vous devriez voir "Plan actuel" sur le plan Enterprise

## 🎉 C'est terminé !

Une fois ces étapes complétées, votre système de paiement sera 100% fonctionnel :

- ✅ Les utilisateurs peuvent souscrire à un plan
- ✅ Les paiements sont traités par Stripe
- ✅ Les abonnements sont mis à jour automatiquement dans Firestore
- ✅ Les renouvellements sont gérés automatiquement
- ✅ Les annulations sont synchronisées

## 📊 Monitoring

### Logs Vercel
Consultez les logs de vos fonctions API :
```
https://vercel.com/albertduplantins-projects/instaquizz/logs
```

### Logs Stripe
Consultez les événements webhook :
```
https://dashboard.stripe.com/test/webhooks
```

## 🔧 Commandes utiles

```powershell
# Voir toutes les variables d'environnement
vercel env ls

# Voir les logs en temps réel
vercel logs --follow

# Tester le webhook localement
stripe listen --forward-to localhost:3000/api/webhook
```

## ⚠️ Important

- Les prix actuels sont des prix de **test** (très bas pour tester facilement)
- Avant de passer en production, créez de nouveaux prix avec les vrais montants
- N'oubliez pas de configurer le webhook en mode **production** aussi

## 🎯 Passage en production

Quand vous serez prêt pour la production :

1. Créez de nouveaux prix production sur Stripe
2. Mettez à jour les Price IDs dans le code
3. Configurez un webhook en mode production
4. Ajoutez `STRIPE_WEBHOOK_SECRET` pour la production
5. Utilisez les vraies clés API Stripe (non-test)

