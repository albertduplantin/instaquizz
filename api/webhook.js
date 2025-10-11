// Webhook Stripe pour gérer les événements de paiement
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialiser Firebase Admin (une seule fois)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export const config = {
  api: {
    bodyParser: false,
  },
};

// Fonction pour récupérer le body raw
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('⚠️ STRIPE_WEBHOOK_SECRET non configuré');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Erreur webhook:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Gérer les différents événements
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Gérer la fin du checkout
async function handleCheckoutCompleted(session) {
  const userId = session.client_reference_id || session.metadata?.userId;
  const subscriptionId = session.subscription;

  if (!userId) {
    console.error('❌ UserId manquant dans la session');
    return;
  }

  // Récupérer les détails de l'abonnement Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0].price.id;

  // Déterminer le plan à partir du price ID
  const plan = getPlanFromPriceId(priceId);

  // Créer ou mettre à jour l'abonnement dans Firestore
  const subscriptionsRef = db.collection('subscriptions');
  const existingSubscription = await subscriptionsRef
    .where('userId', '==', userId)
    .limit(1)
    .get();

  const subscriptionData = {
    userId,
    plan,
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: subscription.customer,
    stripePriceId: priceId,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  if (!existingSubscription.empty) {
    // Mettre à jour l'abonnement existant
    const docId = existingSubscription.docs[0].id;
    await subscriptionsRef.doc(docId).update(subscriptionData);
    console.log(`✅ Abonnement mis à jour pour l'utilisateur ${userId}`);
  } else {
    // Créer un nouvel abonnement
    await subscriptionsRef.add({
      ...subscriptionData,
      created_at: new Date().toISOString(),
    });
    console.log(`✅ Nouvel abonnement créé pour l'utilisateur ${userId}`);
  }
}

// Gérer la mise à jour d'un abonnement
async function handleSubscriptionUpdated(subscription) {
  const subscriptionsRef = db.collection('subscriptions');
  const snapshot = await subscriptionsRef
    .where('stripeSubscriptionId', '==', subscription.id)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.log('⚠️ Abonnement non trouvé dans Firestore');
    return;
  }

  const docId = snapshot.docs[0].id;
  await subscriptionsRef.doc(docId).update({
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  });

  console.log(`✅ Abonnement ${subscription.id} mis à jour`);
}

// Gérer la suppression d'un abonnement
async function handleSubscriptionDeleted(subscription) {
  const subscriptionsRef = db.collection('subscriptions');
  const snapshot = await subscriptionsRef
    .where('stripeSubscriptionId', '==', subscription.id)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.log('⚠️ Abonnement non trouvé dans Firestore');
    return;
  }

  const docId = snapshot.docs[0].id;
  
  // Repasser au plan gratuit
  await subscriptionsRef.doc(docId).update({
    plan: 'free',
    status: 'canceled',
    updated_at: new Date().toISOString(),
  });

  console.log(`✅ Abonnement ${subscription.id} annulé - retour au plan gratuit`);
}

// Gérer un paiement réussi
async function handleInvoicePaymentSucceeded(invoice) {
  console.log(`✅ Paiement réussi pour l'invoice ${invoice.id}`);
  // Vous pouvez ajouter une notification à l'utilisateur ici
}

// Gérer un paiement échoué
async function handleInvoicePaymentFailed(invoice) {
  console.log(`❌ Paiement échoué pour l'invoice ${invoice.id}`);
  // Vous pouvez envoyer un email à l'utilisateur ici
}

// Mapper Price ID vers Plan
function getPlanFromPriceId(priceId) {
  const priceMap = {
    'price_1SGeQrRroRfv8dBg1ygCUmL1': 'basic',
    'price_1SGeQrRroRfv8dBgs5TZqN9w': 'basic',
    'price_1SGeQrRroRfv8dBglET5CtW6': 'pro',
    'price_1SGeQsRroRfv8dBgTiPCLxrz': 'pro',
    'price_1SGeQsRroRfv8dBgaDbnlFP1': 'premium',
    'price_1SGeQsRroRfv8dBgDxEmu7Ht': 'premium',
    'price_1SGeQsRroRfv8dBgqKLN1Z01': 'enterprise',
    'price_1SGeQtRroRfv8dBgSjhiSvtq': 'enterprise',
  };

  return priceMap[priceId] || 'free';
}

