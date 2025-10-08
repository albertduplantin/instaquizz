// Script pour récupérer les Product IDs Stripe
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

async function getStripeProducts() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY non définie dans les variables d\'environnement');
    process.exit(1);
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  console.log('🔍 Récupération des produits Stripe...\n');

  try {
    const products = await stripe.products.list({
      limit: 100,
      active: true
    });

    console.log('📋 Produits trouvés :\n');
    
    products.data.forEach(product => {
      console.log(`🏷️  ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Description: ${product.description || 'Aucune'}`);
      console.log(`   Actif: ${product.active ? 'Oui' : 'Non'}`);
      console.log('');
    });

    console.log('💡 Copiez les Product IDs ci-dessus pour les utiliser dans le script de création de prix.');

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des produits:', error.message);
  }
}

getStripeProducts().catch(console.error);






