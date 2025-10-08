// Script de débogage pour l'import des questions
console.log('🔍 DIAGNOSTIC IMPORT QUESTIONS');

// Test de la fonction de parsing
function testImportParsing() {
  const testText = `Question 1: Quelle est la capitale de la France ?
Question 2: Combien font 2 + 2 ?
Question 3: Qui a peint la Joconde ?`;

  console.log('📝 Texte de test:');
  console.log(testText);
  console.log('');

  // Simulation du parsing
  const newQuestionContents = testText
    .split('\n')
    .map(content => content.trim())
    .filter(content => content.length > 0);

  console.log('✅ Questions parsées:');
  newQuestionContents.forEach((content, index) => {
    console.log(`${index + 1}. ${content}`);
  });
  console.log('');

  console.log(`📊 Total: ${newQuestionContents.length} questions`);
  return newQuestionContents;
}

// Test de la fonction de vérification des doublons
function testDuplicateCheck(questions, newContents) {
  console.log('🔍 Vérification des doublons...');
  
  const existingContents = questions.map(q => q.content.toLowerCase());
  console.log('📋 Questions existantes:', existingContents);
  
  const uniqueContents = newContents.filter(content => 
    !existingContents.includes(content.toLowerCase())
  );
  
  console.log('✅ Questions uniques:', uniqueContents);
  console.log(`📊 Doublons trouvés: ${newContents.length - uniqueContents.length}`);
  
  return uniqueContents;
}

// Simulation complète
console.log('🧪 SIMULATION COMPLÈTE');
console.log('======================');

const questions = [
  { content: 'Question existante 1' },
  { content: 'Question existante 2' }
];

const newContents = testImportParsing();
const uniqueContents = testDuplicateCheck(questions, newContents);

console.log('');
console.log('🎯 RÉSULTAT FINAL:');
console.log(`- Questions à importer: ${newContents.length}`);
console.log(`- Questions uniques: ${uniqueContents.length}`);
console.log(`- Doublons ignorés: ${newContents.length - uniqueContents.length}`);

// Test des cas d'erreur
console.log('');
console.log('⚠️  TESTS DES CAS D\'ERREUR');
console.log('==========================');

// Test 1: Texte vide
const emptyText = '';
const emptyContents = emptyText.split('\n').map(c => c.trim()).filter(c => c.length > 0);
console.log(`1. Texte vide: ${emptyContents.length} questions`);

// Test 2: Seulement des espaces
const spaceText = '   \n  \n   ';
const spaceContents = spaceText.split('\n').map(c => c.trim()).filter(c => c.length > 0);
console.log(`2. Seulement espaces: ${spaceContents.length} questions`);

// Test 3: Toutes des doublons
const duplicateText = 'Question existante 1\nQuestion existante 2';
const duplicateContents = duplicateText.split('\n').map(c => c.trim()).filter(c => c.length > 0);
const duplicateUnique = duplicateContents.filter(content => 
  !questions.map(q => q.content.toLowerCase()).includes(content.toLowerCase())
);
console.log(`3. Toutes doublons: ${duplicateUnique.length} questions uniques`);

console.log('');
console.log('✅ Diagnostic terminé');






