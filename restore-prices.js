// Script pour restaurer les prix originaux après les tests
// Usage: node restore-prices.js

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'subscriptionService.ts');

// Lire le fichier
let content = fs.readFileSync(filePath, 'utf8');

// Remplacer les prix de test par les prix originaux
const replacements = [
  { from: 'price: 0.01, // 1 centime pour les tests', to: 'price: 1.49,' },
  { from: 'price: 0.02, // 2 centimes pour les tests', to: 'price: 4.99,' },
  { from: 'price: 0.03, // 3 centimes pour les tests', to: 'price: 6.99,' },
  { from: 'price: 0.05, // 5 centimes pour les tests', to: 'price: 12.99,' },
  { from: 'annualPrice: 0.10, // 10 centimes pour les tests annuels', to: 'annualPrice: 14.99,' },
  { from: 'annualPrice: 0.20, // 20 centimes pour les tests annuels', to: 'annualPrice: 49.99,' },
  { from: 'annualPrice: 0.30, // 30 centimes pour les tests annuels', to: 'annualPrice: 69.99,' },
  { from: 'annualPrice: 0.50, // 50 centimes pour les tests annuels', to: 'annualPrice: 129.99,' }
];

replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

// Écrire le fichier modifié
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Prix originaux restaurés avec succès !');
console.log('📊 Nouveaux prix:');
console.log('   - Basic: 1,49€/mois (14,99€/an)');
console.log('   - Pro: 4,99€/mois (49,99€/an)');
console.log('   - Premium: 6,99€/mois (69,99€/an)');
console.log('   - Enterprise: 12,99€/mois (129,99€/an)');
console.log('');
console.log('🚀 N\'oubliez pas de redéployer avec: npm run build && npx vercel --prod');
