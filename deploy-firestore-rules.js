const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Vérifier si Firebase CLI est installé
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI détecté');
} catch (error) {
  console.error('❌ Firebase CLI non trouvé. Installez-le avec: npm install -g firebase-tools');
  process.exit(1);
}

// Vérifier si le fichier firebase.json existe
const firebaseJsonPath = path.join(__dirname, 'firebase.json');
if (!fs.existsSync(firebaseJsonPath)) {
  console.log('📝 Création du fichier firebase.json...');
  const firebaseConfig = {
    "firestore": {
      "rules": "firestore.rules",
      "indexes": "firestore.indexes.json"
    },
    "hosting": {
      "public": "dist",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  };
  
  fs.writeFileSync(firebaseJsonPath, JSON.stringify(firebaseConfig, null, 2));
  console.log('✅ firebase.json créé');
}

// Vérifier si le fichier firestore.indexes.json existe
const firestoreIndexesPath = path.join(__dirname, 'firestore.indexes.json');
if (!fs.existsSync(firestoreIndexesPath)) {
  console.log('📝 Création du fichier firestore.indexes.json...');
  const indexesConfig = {
    "indexes": [],
    "fieldOverrides": []
  };
  
  fs.writeFileSync(firestoreIndexesPath, JSON.stringify(indexesConfig, null, 2));
  console.log('✅ firestore.indexes.json créé');
}

// Déployer les règles Firestore
console.log('🚀 Déploiement des règles Firestore...');
try {
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  console.log('✅ Règles Firestore déployées avec succès !');
} catch (error) {
  console.error('❌ Erreur lors du déploiement des règles Firestore:', error.message);
  console.log('\n📋 Instructions manuelles:');
  console.log('1. Connectez-vous à Firebase Console: https://console.firebase.google.com/');
  console.log('2. Sélectionnez votre projet: instaquizz-firebase');
  console.log('3. Allez dans Firestore Database > Règles');
  console.log('4. Copiez le contenu du fichier firestore.rules');
  console.log('5. Collez-le dans l\'éditeur de règles');
  console.log('6. Cliquez sur "Publier"');
  process.exit(1);
}


