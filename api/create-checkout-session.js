// API Vercel Serverless Function pour créer des sessions Stripe Checkout
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configuration CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  // Vérifier que c'est une requête POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId, isAnnual } = req.body;

    // Validation des paramètres
    if (!priceId || !userId) {
      return res.status(400).json({ 
        error: 'Paramètres manquants',
        details: 'priceId et userId sont requis'
      });
    }

    // URLs de succès et d'annulation
    const baseUrl = process.env.VITE_APP_URL || 'https://instaquizz.vercel.app';
    const successUrl = `${baseUrl}/#/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/#/subscription?canceled=true`;

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        isAnnual: isAnnual ? 'true' : 'false'
      },
      subscription_data: {
        metadata: {
          userId: userId,
        }
      },
      // Permettre les codes promo
      allow_promotion_codes: true,
    });

    // Retourner l'URL de la session
    return res.status(200).json({
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe:', error);
    
    return res.status(500).json({
      error: 'Erreur lors de la création de la session',
      message: error.message
    });
  }
}

// Configuration pour Vercel
export const config = {
  api: {
    bodyParser: true,
  },
};

