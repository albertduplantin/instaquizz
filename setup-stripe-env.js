// Script pour configurer les variables d'environnement Stripe
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Configuration des variables d\'environnement Stripe\n');

// Vérifier si .env existe
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Création du fichier .env...');
  fs.writeFileSync(envPath, '');
}

// Lire le fichier .env existant
let envContent = fs.readFileSync(envPath, 'utf8');

// Demander la clé secrète Stripe
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('🔑 Entrez votre clé secrète Stripe (sk_live_...): ', (secretKey) => {
  if (!secretKey.startsWith('sk_live_')) {
    console.log('❌ La clé doit commencer par sk_live_');
    rl.close();
    return;
  }

  // Mettre à jour ou ajouter STRIPE_SECRET_KEY
  if (envContent.includes('STRIPE_SECRET_KEY=')) {
    envContent = envContent.replace(/STRIPE_SECRET_KEY=.*/, `STRIPE_SECRET_KEY=${secretKey}`);
  } else {
    envContent += `\nSTRIPE_SECRET_KEY=${secretKey}\n`;
  }

  // Écrire le fichier .env
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Clé Stripe configurée dans .env');
  console.log('🚀 Vous pouvez maintenant utiliser:');
  console.log('   node update-stripe-prices.js        # Mettre à jour vers les prix de production');
  console.log('   node update-stripe-prices.js test   # Restaurer les prix de test');
  
  rl.close();
});
