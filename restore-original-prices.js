// Script pour restaurer les prix originaux après les tests
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prix originaux à restaurer
const ORIGINAL_PRICES = {
  basic: { monthly: 1.49, annual: 14.99 },
  pro: { monthly: 4.99, annual: 49.99 },
  premium: { monthly: 6.99, annual: 69.99 },
  enterprise: { monthly: 12.99, annual: 129.99 }
};

// Price IDs originaux
const ORIGINAL_PRICE_IDS = {
  basic: {
    monthly: 'price_1S5oyDRroRfv8dBgV4xkdCLT',
    annual: 'price_1S5qN2RroRfv8dBg7g7RpSCY'
  },
  pro: {
    monthly: 'price_1S5qL0RroRfv8dBgmobKdJIs',
    annual: 'price_1S5qL0RroRfv8dBg1gaBJJdY'
  },
  premium: {
    monthly: 'price_1S5oysRroRfv8dBgCUlnpNKc',
    annual: 'price_1S5q0TRroRfv8dBgsWAP4QFV'
  },
  enterprise: {
    monthly: 'price_1S5ozkRroRfv8dBghnJ3NHi5',
    annual: 'price_1S5qPLRroRfv8dBgEuEMLpS0'
  }
};

function restoreOriginalPrices() {
  const filePath = path.join(__dirname, 'src', 'lib', 'subscriptionService.ts');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ Fichier subscriptionService.ts non trouvé');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Restaurer les prix
  content = content.replace(/price: 0\.0[1-5], \/\/ [0-9]+ centimes pour les tests/g, (match) => {
    const planMatch = match.match(/price: 0\.0([1-5]),/);
    if (planMatch) {
      const centimes = parseInt(planMatch[1]);
      const planNames = ['', 'basic', 'pro', 'premium', 'enterprise'];
      const planName = planNames[centimes];
      if (planName && ORIGINAL_PRICES[planName]) {
        return `price: ${ORIGINAL_PRICES[planName].monthly},`;
      }
    }
    return match;
  });

  // Restaurer les prix annuels
  content = content.replace(/annualPrice: 0\.[0-9]+, \/\/ [0-9]+ centimes pour les tests annuels/g, (match) => {
    const planMatch = match.match(/annualPrice: 0\.([0-9]+),/);
    if (planMatch) {
      const centimes = parseInt(planMatch[1]);
      const planNames = ['', 'basic', 'pro', 'premium', 'enterprise'];
      const planName = planNames[centimes / 10];
      if (planName && ORIGINAL_PRICES[planName]) {
        return `annualPrice: ${ORIGINAL_PRICES[planName].annual},`;
      }
    }
    return match;
  });

  // Restaurer les Price IDs
  Object.entries(ORIGINAL_PRICE_IDS).forEach(([planName, priceIds]) => {
    // Mensuel
    const monthlyPattern = new RegExp(`priceId: 'price_[^']+', \\/\\/ 0\\.[0-9]+€`, 'g');
    content = content.replace(monthlyPattern, `priceId: '${priceIds.monthly}',`);
    
    // Annuel
    const annualPattern = new RegExp(`priceIdAnnual: 'price_[^']+', \\/\\/ 0\\.[0-9]+€`, 'g');
    content = content.replace(annualPattern, `priceIdAnnual: '${priceIds.annual}',`);
  });

  // Supprimer les commentaires de test
  content = content.replace(/ \/\/ [0-9]+ centimes pour les tests/g, '');
  content = content.replace(/ \/\/ [0-9]+ centimes pour les tests annuels/g, '');

  fs.writeFileSync(filePath, content);
  console.log('✅ Prix originaux restaurés dans subscriptionService.ts');
  console.log('🚀 N\'oubliez pas de déployer avec: npm run build && npx vercel --prod');
}

restoreOriginalPrices();






