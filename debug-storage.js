// Script de debug pour Supabase Storage
// Copiez-collez ce code dans la console du navigateur (F12)

console.log('🔧 Début du debug Supabase Storage...');

// 1. Vérifier les variables d'environnement
console.log('🔍 Test 1: Variables d\'environnement');
console.log('VITE_SUPABASE_URL:', import.meta.env?.VITE_SUPABASE_URL || 'Non définie');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env?.VITE_SUPABASE_ANON_KEY ? 'Définie' : 'Non définie');

// 2. Test de connexion Supabase
console.log('🔍 Test 2: Connexion Supabase');
if (typeof window !== 'undefined' && window.supabase) {
  console.log('✅ Supabase client trouvé');
  
  // Test de récupération des buckets
  window.supabase.storage.listBuckets()
    .then(({ data: buckets, error }) => {
      if (error) {
        console.error('❌ Erreur list buckets:', error);
      } else {
        console.log('✅ Buckets trouvés:', buckets?.length || 0);
        buckets?.forEach(bucket => {
          console.log(`  - ${bucket.name} (public: ${bucket.public})`);
        });
        
        // Vérifier si question-images existe
        const bucketExists = buckets?.some(bucket => bucket.name === 'question-images');
        if (bucketExists) {
          console.log('✅ Bucket question-images trouvé');
          
          // Test de lecture du bucket
          return window.supabase.storage
            .from('question-images')
            .list();
        } else {
          console.log('❌ Bucket question-images non trouvé');
          return Promise.reject('Bucket non trouvé');
        }
      }
    })
    .then(({ data: files, error }) => {
      if (error) {
        console.error('❌ Erreur list files:', error);
      } else {
        console.log('✅ Lecture du bucket OK:', files?.length || 0, 'fichiers');
      }
    })
    .catch(error => {
      console.error('❌ Erreur générale:', error);
    });
} else {
  console.error('❌ Supabase client non trouvé');
}

console.log('🔧 Debug terminé');
