const admin = require('firebase-admin');
const readline = require('readline');

// Initialiser Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function fixQuestionsOwner() {
  try {
    console.log('🔧 OUTIL DE CORRECTION DES PROPRIÉTAIRES DE QUESTIONS\n');
    console.log('Cet outil va vous permettre de réattribuer les questions à votre compte.\n');
    
    // Récupérer toutes les questions
    const questionsSnapshot = await db.collection('questions').get();
    
    if (questionsSnapshot.empty) {
      console.log('❌ Aucune question trouvée.');
      rl.close();
      return;
    }
    
    console.log(`✅ ${questionsSnapshot.size} questions trouvées.\n`);
    
    // Grouper par teacher_id
    const questionsByTeacher = {};
    questionsSnapshot.forEach(doc => {
      const data = doc.data();
      if (!questionsByTeacher[data.teacher_id]) {
        questionsByTeacher[data.teacher_id] = [];
      }
      questionsByTeacher[data.teacher_id].push({
        id: doc.id,
        ...data
      });
    });
    
    console.log('📊 Questions par enseignant:');
    for (const [teacherId, questions] of Object.entries(questionsByTeacher)) {
      console.log(`  - ${teacherId}: ${questions.length} questions`);
    }
    console.log('');
    
    // Demander le nouvel ID
    const newTeacherId = await question('Entrez votre UID Firebase (l\'ID de votre compte actuel): ');
    
    if (!newTeacherId || newTeacherId.trim() === '') {
      console.log('❌ UID invalide.');
      rl.close();
      return;
    }
    
    console.log(`\n✅ Vous allez réattribuer toutes les questions à: ${newTeacherId}\n`);
    
    const confirm = await question('Confirmer ? (oui/non): ');
    
    if (confirm.toLowerCase() !== 'oui') {
      console.log('❌ Opération annulée.');
      rl.close();
      return;
    }
    
    console.log('\n🔄 Mise à jour en cours...\n');
    
    const batch = db.batch();
    let count = 0;
    
    questionsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.teacher_id !== newTeacherId) {
        batch.update(doc.ref, { teacher_id: newTeacherId });
        count++;
      }
    });
    
    if (count === 0) {
      console.log('✅ Toutes les questions appartiennent déjà à ce compte.');
    } else {
      await batch.commit();
      console.log(`✅ ${count} questions ont été réattribuées avec succès !`);
    }
    
    // Mettre à jour aussi les classes
    console.log('\n🔄 Mise à jour des classes...\n');
    
    const classesSnapshot = await db.collection('classes').get();
    const classBatch = db.batch();
    let classCount = 0;
    
    classesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.teacher_id !== newTeacherId) {
        classBatch.update(doc.ref, { teacher_id: newTeacherId });
        classCount++;
      }
    });
    
    if (classCount > 0) {
      await classBatch.commit();
      console.log(`✅ ${classCount} classes ont été réattribuées !`);
    }
    
    console.log('\n✅ TERMINÉ ! Rechargez votre application.\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    rl.close();
    process.exit();
  }
}

fixQuestionsOwner();

