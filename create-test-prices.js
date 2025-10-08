// Script pour créer de nouveaux prix de test Stripe
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Product IDs récupérés
const PRODUCT_IDS = {
  basic: 'prod_T1sjifIOi8mLnd',    // InstaQuizz Basique
  pro: 'prod_T1u9j3MoSyab5B',      // InstaQuizz Pro
  premium: 'prod_T1skztwqLP8S9G',  // InstaQuizz Premium
  enterprise: 'prod_T1slnvww4xL4xp' // InstaQuizz Entreprise
};

// Prix de test (en centimes)
const TEST_PRICES = {
  basic: {
    monthly: 0.01,  // 1 centime
    annual: 0.10    // 10 centimes
  },
  pro: {
    monthly: 0.02,  // 2 centimes
    annual: 0.20    // 20 centimes
  },
  premium: {
    monthly: 0.03,  // 3 centimes
    annual: 0.30    // 30 centimes
  },
  enterprise: {
    monthly: 0.05,  // 5 centimes
    annual: 0.50    // 50 centimes
  }
};

async function createTestPrices() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY non définie dans les variables d\'environnement');
    process.exit(1);
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  console.log('🧪 Création des prix de test Stripe...\n');

  const newPriceIds = {};

  for (const [planName, prices] of Object.entries(TEST_PRICES)) {
    console.log(`📝 Création des prix pour ${planName.toUpperCase()}:`);
    
    try {
      // Créer le prix mensuel
      const monthlyPrice = await stripe.prices.create({
        product: PRODUCT_IDS[planName],
        unit_amount: Math.round(prices.monthly * 100), // Convertir en centimes
        currency: 'eur',
        recurring: {
          interval: 'month'
        },
        nickname: `${planName}_test_monthly`
      });
      console.log(`   ✅ Mensuel: ${prices.monthly}€ (${monthlyPrice.id})`);

      // Créer le prix annuel
      const annualPrice = await stripe.prices.create({
        product: PRODUCT_IDS[planName],
        unit_amount: Math.round(prices.annual * 100), // Convertir en centimes
        currency: 'eur',
        recurring: {
          interval: 'year'
        },
        nickname: `${planName}_test_annual`
      });
      console.log(`   ✅ Annuel: ${prices.annual}€ (${annualPrice.id})`);

      newPriceIds[planName] = {
        monthly: monthlyPrice.id,
        annual: annualPrice.id
      };

    } catch (error) {
      console.error(`   ❌ Erreur pour ${planName}:`, error.message);
    }
    
    console.log('');
  }

  console.log('🎉 Prix de test créés !');
  console.log('\n📋 Nouveaux Price IDs à utiliser dans votre application :');
  console.log(JSON.stringify(newPriceIds, null, 2));
  
  console.log('\n💡 Pour utiliser ces prix :');
  console.log('1. Remplacez les Price IDs dans votre code');
  console.log('2. Testez les paiements');
  console.log('3. Supprimez ces prix après les tests');
}

createTestPrices().catch(console.error);






