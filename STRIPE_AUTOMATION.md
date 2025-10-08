# 🤖 AUTOMATISATION STRIPE

## 🚀 **COMMANDES RAPIDES**

### **1. Configuration initiale (une seule fois)**
```bash
npm run stripe:setup
```
- Configure votre clé secrète Stripe
- Crée le fichier `.env` avec vos credentials

### **2. Mettre à jour vers les prix de production**
```bash
npm run stripe:update
```
- Met à jour tous les prix Stripe vers les prix de production
- Basic: 1,49€/mois, 14,99€/an
- Pro: 4,99€/mois, 49,99€/an
- Premium: 6,99€/mois, 69,99€/an
- Enterprise: 12,99€/mois, 129,99€/an

### **3. Restaurer les prix de test**
```bash
npm run stripe:test
```
- Restaure tous les prix vers les prix de test
- Basic: 0,01€/mois, 0,10€/an
- Pro: 0,02€/mois, 0,20€/an
- Premium: 0,03€/mois, 0,30€/an
- Enterprise: 0,05€/mois, 0,50€/an

## 🔧 **FONCTIONNEMENT**

### **Fichiers créés :**
- `update-stripe-prices.js` - Script principal d'automatisation
- `setup-stripe-env.js` - Configuration des variables d'environnement
- `.env` - Fichier de configuration (créé automatiquement)

### **Price IDs utilisés :**
- **Basic** : `price_1S5oyDRroRfv8dBgV4xkdCLT` (mensuel), `price_1S5qN2RroRfv8dBg7g7RpSCY` (annuel)
- **Pro** : `price_1S5qL0RroRfv8dBgmobKdJIs` (mensuel), `price_1S5qL0RroRfv8dBg1gaBJJdY` (annuel)
- **Premium** : `price_1S5oysRroRfv8dBgCUlnpNKc` (mensuel), `price_1S5q0TRroRfv8dBgsWAP4QFV` (annuel)
- **Enterprise** : `price_1S5ozkRroRfv8dBghnJ3NHi5` (mensuel), `price_1S5qPLRroRfv8dBgEuEMLpS0` (annuel)

## ⚠️ **IMPORTANT**

- ✅ **Les Price IDs ne changent jamais**
- ✅ **Seuls les montants sont modifiés**
- ✅ **Les abonnements existants gardent leur prix**
- ✅ **Les nouveaux abonnements utilisent le nouveau prix**

## 🎯 **WORKFLOW RECOMMANDÉ**

1. **Tests avec prix bas :**
   ```bash
   npm run stripe:test
   ```

2. **Tests des paiements :**
   - Testez sur https://instaquizz.vercel.app/#subscription
   - Vérifiez que les paiements fonctionnent

3. **Passage en production :**
   ```bash
   npm run stripe:update
   ```

4. **Déploiement :**
   ```bash
   npm run build
   npx vercel --prod
   npx vercel alias [URL_TEMPORAIRE] instaquizz.vercel.app
   ```

## 🔍 **VÉRIFICATION**

Après chaque mise à jour, vérifiez sur :
- **Stripe Dashboard** : https://dashboard.stripe.com/products
- **Votre site** : https://instaquizz.vercel.app/#subscription






