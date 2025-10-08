import { execSync } from 'child_process';

console.log('🚀 Forçage du redéploiement des règles Firestore...\n');

try {
  // Vérifier la connexion Firebase
  console.log('1. Vérification de la connexion Firebase...');
  execSync('firebase projects:list', { stdio: 'pipe' });
  console.log('✅ Connecté à Firebase');

  // Sélectionner le projet
  console.log('\n2. Sélection du projet...');
  execSync('firebase use instaquizz-firebase', { stdio: 'pipe' });
  console.log('✅ Projet instaquizz-firebase sélectionné');

  // Redéployer les règles
  console.log('\n3. Redéploiement des règles Firestore...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  console.log('✅ Règles redéployées avec succès');

  console.log('\n🎉 Redéploiement terminé !');
  console.log('📋 Prochaines étapes:');
  console.log('   1. Attendre 2-3 minutes pour la propagation');
  console.log('   2. Vider le cache du navigateur (Ctrl+F5)');
  console.log('   3. Recharger l\'application');
  console.log('   4. Vérifier les logs de débogage dans la console');

} catch (error) {
  console.error('❌ Erreur lors du redéploiement:', error.message);
  process.exit(1);
}
