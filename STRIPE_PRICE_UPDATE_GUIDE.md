# Guide de mise à jour des prix Stripe

## 📋 Nouveaux prix à configurer

### Plan BASIC
- **Mensuel** : 0.20€ (20 centimes)
- **Annuel** : 1.92€ (192 centimes) - 20% de réduction

### Plan PRO  
- **Mensuel** : 0.90€ (90 centimes)
- **Annuel** : 8.64€ (864 centimes) - 20% de réduction

### Plan PREMIUM
- **Mensuel** : 1.99€ (199 centimes)
- **Annuel** : 19.10€ (1910 centimes) - 20% de réduction

## 🔧 Étapes pour mettre à jour sur Stripe

### 1. Accéder au Dashboard Stripe
1. Connectez-vous à [dashboard.stripe.com](https://dashboard.stripe.com)
2. Assurez-vous d'être en mode **Test** ou **Live** selon vos besoins

### 2. Créer de nouveaux prix
**Pour chaque plan (BASIC, PRO, PREMIUM) :**

#### Prix mensuel :
1. Allez dans **Produits** > **Prix**
2. Cliquez sur **Créer un prix**
3. Sélectionnez le produit correspondant
4. Configurez :
   - **Montant** : [montant en centimes]
   - **Devise** : EUR
   - **Facturation** : Récurrent
   - **Intervalle** : Mensuel
5. Cliquez sur **Créer un prix**
6. **Copiez l'ID du prix** (commence par `price_`)

#### Prix annuel :
1. Répétez les étapes ci-dessus
2. Configurez :
   - **Montant** : [montant en centimes]
   - **Devise** : EUR
   - **Facturation** : Récurrent
   - **Intervalle** : Annuel
3. Cliquez sur **Créer un prix**
4. **Copiez l'ID du prix** (commence par `price_`)

### 3. Mettre à jour le code
Une fois les nouveaux prix créés, mettez à jour les `priceId` dans `src/lib/subscriptionService.ts` :

```typescript
basic: {
  priceId: 'price_NOUVEAU_ID_MENSUEL',
  priceIdAnnual: 'price_NOUVEAU_ID_ANNUEL',
  // ...
},
pro: {
  priceId: 'price_NOUVEAU_ID_MENSUEL',
  priceIdAnnual: 'price_NOUVEAU_ID_ANNUEL',
  // ...
},
premium: {
  priceId: 'price_NOUVEAU_ID_MENSUEL',
  priceIdAnnual: 'price_NOUVEAU_ID_ANNUEL',
  // ...
}
```

## 💰 Calcul des marges

### Coûts Firebase estimés (par utilisateur/mois)
- **BASIC** : ~0.09€
- **PRO** : ~0.36€  
- **PREMIUM** : ~0.91€

### Marges de profit
- **BASIC** : 0.20€ - 0.09€ = **0.11€** (55% de marge)
- **PRO** : 0.90€ - 0.36€ = **0.54€** (60% de marge)
- **PREMIUM** : 1.99€ - 0.91€ = **1.08€** (54% de marge)

## ✅ Vérification
1. Testez les nouveaux prix en mode test
2. Vérifiez que les paiements fonctionnent
3. Déployez en production
4. Surveillez les métriques de conversion

## 🚨 Important
- Les anciens prix resteront actifs pour les abonnements existants
- Les nouveaux prix s'appliqueront aux nouveaux abonnements
- Testez toujours en mode test avant de passer en live



