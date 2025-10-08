const admin = require('firebase-admin');
const fs = require('fs');

// Initialiser Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportQuestions() {
  try {
    console.log('🔍 Récupération de toutes les questions depuis Firebase...\n');
    
    // Récupérer toutes les questions
    const questionsSnapshot = await db.collection('questions').get();
    
    if (questionsSnapshot.empty) {
      console.log('❌ Aucune question trouvée dans Firebase.');
      return;
    }
    
    console.log(`✅ ${questionsSnapshot.size} questions trouvées.\n`);
    
    // Récupérer aussi les classes pour avoir les noms
    const classesSnapshot = await db.collection('classes').get();
    const classesMap = {};
    classesSnapshot.forEach(doc => {
      classesMap[doc.id] = doc.data();
    });
    
    // Organiser les questions
    const questions = [];
    const questionsByTeacher = {};
    const questionsByClass = {};
    
    questionsSnapshot.forEach(doc => {
      const data = doc.data();
      const question = {
        id: doc.id,
        content: data.content,
        class_id: data.class_id,
        teacher_id: data.teacher_id,
        image_url: data.image_url,
        image_alt: data.image_alt,
        links: data.links,
        created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : data.created_at
      };
      
      questions.push(question);
      
      // Grouper par teacher
      if (!questionsByTeacher[data.teacher_id]) {
        questionsByTeacher[data.teacher_id] = [];
      }
      questionsByTeacher[data.teacher_id].push(question);
      
      // Grouper par classe
      if (!questionsByClass[data.class_id]) {
        questionsByClass[data.class_id] = [];
      }
      questionsByClass[data.class_id].push(question);
    });
    
    // Créer le rapport détaillé
    let report = '═══════════════════════════════════════════════════════════\n';
    report += '         EXPORT DES QUESTIONS - INSTAQUIZZ\n';
    report += '═══════════════════════════════════════════════════════════\n\n';
    report += `Date d'export: ${new Date().toLocaleString('fr-FR')}\n`;
    report += `Total de questions: ${questions.length}\n\n`;
    
    // Statistiques par enseignant
    report += '─────────────────────────────────────────────────────────\n';
    report += 'STATISTIQUES PAR ENSEIGNANT\n';
    report += '─────────────────────────────────────────────────────────\n\n';
    
    for (const [teacherId, teacherQuestions] of Object.entries(questionsByTeacher)) {
      report += `Enseignant ID: ${teacherId}\n`;
      report += `Nombre de questions: ${teacherQuestions.length}\n\n`;
    }
    
    // Questions par classe
    report += '\n═══════════════════════════════════════════════════════════\n';
    report += 'QUESTIONS PAR CLASSE\n';
    report += '═══════════════════════════════════════════════════════════\n\n';
    
    for (const [classId, classQuestions] of Object.entries(questionsByClass)) {
      const className = classesMap[classId]?.name || 'Classe sans nom';
      report += `\n━━━ CLASSE: ${className} (ID: ${classId}) ━━━\n`;
      report += `Nombre de questions: ${classQuestions.length}\n`;
      report += `Enseignant ID: ${classQuestions[0]?.teacher_id || 'Inconnu'}\n\n`;
      
      classQuestions.forEach((q, index) => {
        report += `${index + 1}. ${q.content}\n`;
        if (q.image_url) {
          report += `   📷 Image: ${q.image_alt || 'Sans description'}\n`;
        }
        if (q.links && q.links.length > 0) {
          report += `   🔗 Liens: ${q.links.length}\n`;
          q.links.forEach(link => {
            report += `      - ${link.title}: ${link.url}\n`;
          });
        }
        report += `   ID: ${q.id}\n`;
        report += `   Date: ${q.created_at}\n\n`;
      });
    }
    
    // Créer aussi un export JSON
    const jsonExport = {
      exportDate: new Date().toISOString(),
      totalQuestions: questions.length,
      teachers: Object.keys(questionsByTeacher),
      questions: questions,
      classes: Object.entries(questionsByClass).map(([classId, qs]) => ({
        classId,
        className: classesMap[classId]?.name || 'Sans nom',
        teacherId: qs[0]?.teacher_id,
        questionCount: qs.length,
        questions: qs
      }))
    };
    
    // Sauvegarder les fichiers
    fs.writeFileSync('questions-export.txt', report, 'utf8');
    fs.writeFileSync('questions-export.json', JSON.stringify(jsonExport, null, 2), 'utf8');
    
    console.log('✅ Export terminé !');
    console.log('\nFichiers créés:');
    console.log('  📄 questions-export.txt  (format texte lisible)');
    console.log('  📄 questions-export.json (format JSON structuré)');
    console.log('\n' + '─'.repeat(60));
    console.log('RÉSUMÉ:');
    console.log(`  Total de questions: ${questions.length}`);
    console.log(`  Enseignants uniques: ${Object.keys(questionsByTeacher).length}`);
    console.log(`  Classes concernées: ${Object.keys(questionsByClass).length}`);
    console.log('─'.repeat(60) + '\n');
    
    // Afficher les IDs des enseignants
    console.log('IDs des enseignants trouvés:');
    for (const teacherId of Object.keys(questionsByTeacher)) {
      console.log(`  - ${teacherId} (${questionsByTeacher[teacherId].length} questions)`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'export:', error);
  } finally {
    process.exit();
  }
}

exportQuestions();

