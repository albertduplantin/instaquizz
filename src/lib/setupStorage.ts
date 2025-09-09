import { supabase } from './supabase'

export async function setupImageStorage() {
  try {
    // Vérifier si le bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Erreur lors de la récupération des buckets:', listError)
      return { success: false, error: listError }
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'question-images')
    
    if (!bucketExists) {
      console.error('❌ Le bucket "question-images" n\'existe pas. Veuillez le créer manuellement dans le tableau de bord Supabase.')
      return { success: false, error: new Error('Bucket "question-images" non trouvé.') }
    } else {
      console.log('✅ Bucket question-images existe et est prêt.')
      return { success: true, created: false }
    }
  } catch (error) {
    console.error('Erreur lors de la configuration du stockage:', error)
    return { success: false, error }
  }
}

// Fonction pour tester l'upload
export async function testImageUpload(file: File) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `test-${Date.now()}.${fileExt}`
    const filePath = `question-images/${fileName}`

    const { error } = await supabase.storage
      .from('question-images')
      .upload(filePath, file)

    if (error) {
      console.error('Erreur test upload:', error)
      return { success: false, error }
    }

    const { data: urlData } = supabase.storage
      .from('question-images')
      .getPublicUrl(filePath)

    console.log('Test upload réussi:', urlData.publicUrl)
    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('Erreur test upload:', error)
    return { success: false, error }
  }
}
