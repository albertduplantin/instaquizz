# SAUVEGARDE DES PRIX ORIGINAUX

## 📊 PRIX ORIGINAUX (AVANT LES TESTS)

### Plans Mensuels :
- **Basic** : 1,49€/mois
- **Pro** : 4,99€/mois  
- **Premium** : 6,99€/mois
- **Enterprise** : 12,99€/mois

### Plans Annuels :
- **Basic** : 14,99€/an (20% de réduction)
- **Pro** : 49,99€/an (20% de réduction)
- **Premium** : 69,99€/an (20% de réduction)
- **Enterprise** : 129,99€/an (20% de réduction)

## 🧪 PRIX DE TEST ACTUELS

### Plans Mensuels :
- **Basic** : 0,01€/mois (1 centime)
- **Pro** : 0,02€/mois (2 centimes)
- **Premium** : 0,03€/mois (3 centimes)
- **Enterprise** : 0,05€/mois (5 centimes)

### Plans Annuels :
- **Basic** : 0,10€/an (10 centimes)
- **Pro** : 0,20€/an (20 centimes)
- **Premium** : 0,30€/an (30 centimes)
- **Enterprise** : 0,50€/an (50 centimes)

## 🔄 RESTAURATION

Pour restaurer les prix originaux après les tests :

```bash
node restore-prices.js
npm run build
npx vercel --prod
```

## 📝 NOTES

- Les Price IDs Stripe restent les mêmes
- Seuls les montants changent dans Stripe
- Les abonnements existants gardent leur prix
- Les nouveaux abonnements utilisent le nouveau prix

## 🎯 URL DE PRODUCTION

**URL actuelle :** https://instaquizz-63rhk47pn-albertduplantins-projects.vercel.app

**Page des plans :** https://instaquizz-63rhk47pn-albertduplantins-projects.vercel.app/#subscription






