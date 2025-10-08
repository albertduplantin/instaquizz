#!/usr/bin/env node

/**
 * Script pour mettre à jour les prix Stripe avec les nouveaux tarifs
 * 
 * Utilisation:
 * node update-stripe-prices.js
 * 
 * Prérequis:
 * - Stripe CLI installé et configuré
 * - Clé API Stripe configurée
 */

const { execSync } = require('child_process');

// Nouveaux prix (en centimes pour Stripe)
const newPrices = {
  basic: {
    monthly: 20, // 0.20€ = 20 centimes
    annual: 192  // 1.92€ = 192 centimes
  },
  pro: {
    monthly: 90, // 0.90€ = 90 centimes
    annual: 864  // 8.64€ = 864 centimes
  },
  premium: {
    monthly: 199, // 1.99€ = 199 centimes
    annual: 1910 // 19.10€ = 1910 centimes
  }
};

// IDs des prix existants (à mettre à jour)
const priceIds = {
  basic: {
    monthly: 'price_1S5sZ7RroRfv8dBg9zAOZwmm',
    annual: 'price_1S5sZ8RroRfv8dBgp3w5cQhw'
  },
  pro: {
    monthly: 'price_1S5sZ8RroRfv8dBgjGxiAmwq',
    annual: 'price_1S5sZ8RroRfv8dBgyPQWY2xi'
  },
  premium: {
    monthly: 'price_1S5sZ8RroRfv8dBgpOx5phnQ',
    annual: 'price_1S5sZ9RroRfv8dBgZ1nDqp8h'
  }
};

async function updateStripePrices() {
  console.log('🔄 Mise à jour des prix Stripe...\n');

  for (const [plan, prices] of Object.entries(newPrices)) {
    console.log(`📦 Plan ${plan.toUpperCase()}:`);
    
    // Mettre à jour le prix mensuel
    try {
      console.log(`  💰 Prix mensuel: ${prices.monthly} centimes`);
      const monthlyCommand = `stripe prices update ${priceIds[plan].monthly} --unit-amount=${prices.monthly}`;
      console.log(`  🔧 Commande: ${monthlyCommand}`);
      
      // Exécuter la commande Stripe
      execSync(monthlyCommand, { stdio: 'inherit' });
      console.log(`  ✅ Prix mensuel mis à jour\n`);
    } catch (error) {
      console.error(`  ❌ Erreur pour le prix mensuel: ${error.message}\n`);
    }

    // Mettre à jour le prix annuel
    try {
      console.log(`  💰 Prix annuel: ${prices.annual} centimes`);
      const annualCommand = `stripe prices update ${priceIds[plan].annual} --unit-amount=${prices.annual}`;
      console.log(`  🔧 Commande: ${annualCommand}`);
      
      // Exécuter la commande Stripe
      execSync(annualCommand, { stdio: 'inherit' });
      console.log(`  ✅ Prix annuel mis à jour\n`);
    } catch (error) {
      console.error(`  ❌ Erreur pour le prix annuel: ${error.message}\n`);
    }
  }

  console.log('🎉 Mise à jour terminée !');
  console.log('\n📋 Résumé des nouveaux prix:');
  console.log('  BASIC: 0.20€/mois (1.92€/an)');
  console.log('  PRO: 0.90€/mois (8.64€/an)');
  console.log('  PREMIUM: 1.99€/mois (19.10€/an)');
  console.log('\n💡 N\'oubliez pas de mettre à jour les priceId dans le code si nécessaire !');
}

// Vérifier si Stripe CLI est configuré
try {
  execSync('stripe config --list', { stdio: 'pipe' });
  updateStripePrices().catch(console.error);
} catch (error) {
  console.error('❌ Stripe CLI n\'est pas configuré. Veuillez d\'abord exécuter:');
  console.error('   stripe login');
  console.error('   stripe config --set publishable_key pk_test_...');
  console.error('   stripe config --set secret_key sk_test_...');
}