import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { setupImageStorage } from '../lib/setupStorage'

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string, imageAlt: string) => void
  onImageRemoved: () => void
  currentImageUrl?: string
  currentImageAlt?: string
  disabled?: boolean
}

export function ImageUpload({ 
  onImageUploaded, 
  onImageRemoved, 
  currentImageUrl, 
  currentImageAlt,
  disabled = false 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [storageReady, setStorageReady] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Configurer le stockage au montage du composant
  useEffect(() => {
    const initStorage = async () => {
      try {
        const result = await setupImageStorage()
        setStorageReady(result.success)
      } catch (error) {
        console.error('Erreur setup storage:', error)
        // En cas d'erreur, on essaie quand même l'upload
        setStorageReady(true)
      }
    }
    initStorage()
  }, [])

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('L\'image doit faire moins de 5MB')
      return
    }

    if (!storageReady) {
      alert('Le stockage d\'images n\'est pas encore configuré. Veuillez réessayer dans quelques secondes.')
      return
    }

    setIsUploading(true)
    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `question-images/${fileName}`

      // Upload vers Supabase Storage
      const { error } = await supabase.storage
        .from('question-images')
        .upload(filePath, file)

      if (error) {
        console.error('Erreur upload:', error)
        throw new Error(`Erreur lors de l'upload: ${error.message}`)
      }
      
      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('question-images')
        .getPublicUrl(filePath)
      
      onImageUploaded(urlData.publicUrl, file.name)
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      alert('Erreur lors de l\'upload de l\'image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled || isUploading) return
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const removeImage = () => {
    onImageRemoved()
  }

  const runDebug = async () => {
    console.log('🔧 Début du debug Supabase Storage...');
    
    try {
      // 1. Test de connexion Supabase
      console.log('🔍 Test 1: Vérification de la connexion Supabase...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('❌ Erreur auth:', authError.message);
        return;
      }
      console.log('✅ Utilisateur connecté:', user?.email || 'Anonyme');

      // 2. Test de récupération des buckets
      console.log('🔍 Test 2: Récupération de la liste des buckets...');
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      if (listError) {
        console.error('❌ Erreur list buckets:', listError.message);
        return;
      }
      console.log('✅ Buckets trouvés:', buckets?.length || 0);
      buckets?.forEach(bucket => {
        console.log(`  - ${bucket.name} (public: ${bucket.public})`);
      });

      // 3. Test de vérification du bucket question-images
      console.log('🔍 Test 3: Vérification du bucket question-images...');
      const bucketExists = buckets?.some(bucket => bucket.name === 'question-images');
      if (bucketExists) {
        console.log('✅ Bucket question-images trouvé');
        
        // 4. Test de lecture du bucket
        console.log('🔍 Test 4: Test de lecture du bucket...');
        const { data: files, error: listFilesError } = await supabase.storage
          .from('question-images')
          .list();
        
        if (listFilesError) {
          console.error('❌ Erreur list files:', listFilesError.message);
        } else {
          console.log('✅ Lecture du bucket OK:', files?.length || 0, 'fichiers');
        }

        // 5. Test d'upload d'un fichier test
        console.log('🔍 Test 5: Test d\'upload d\'un fichier...');
        const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const { error: uploadError } = await supabase.storage
          .from('question-images')
          .upload(`test-${Date.now()}.txt`, testFile);
        
        if (uploadError) {
          console.error('❌ Erreur upload:', uploadError.message);
        } else {
          console.log('✅ Upload test réussi');
        }

      } else {
        console.log('❌ Bucket question-images non trouvé');
      }

      // 6. Test des variables d'environnement
      console.log('🔍 Test 6: Vérification des variables d\'environnement...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      console.log('URL:', supabaseUrl ? '✅ Définie' : '❌ Manquante');
      console.log('Key:', supabaseKey ? '✅ Définie' : '❌ Manquante');
      if (supabaseUrl) {
        console.log('URL complète:', supabaseUrl);
      }

    } catch (error) {
      console.error('❌ Erreur générale:', error);
    }
    
    console.log('🔧 Debug terminé');
  };

  return (
    <div className="space-y-4">
      {/* Bouton de debug */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">🔧 Debug Storage</h4>
        <button
          onClick={runDebug}
          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
        >
          Lancer le Debug
        </button>
        <p className="text-xs text-yellow-700 mt-1">
          Ouvrez la console (F12) pour voir les résultats
        </p>
      </div>
      
      {/* Zone d'upload */}
      {!currentImageUrl && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600">Upload en cours...</p>
            </div>
          ) : !storageReady ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              <p className="text-sm text-gray-600">Configuration du stockage...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                <p className="font-medium">Cliquez ou glissez-déposez une image</p>
                <p className="text-xs">PNG, JPG, GIF jusqu'à 5MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aperçu de l'image */}
      {currentImageUrl && (
        <div className="relative">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={currentImageUrl}
                  alt={currentImageAlt || 'Image de la question'}
                  className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {currentImageAlt || 'Image de la question'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentImageUrl}
                </p>
              </div>
              <button
                onClick={removeImage}
                disabled={disabled}
                className="flex-shrink-0 p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                title="Supprimer l'image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Bouton pour changer l'image */}
          {!disabled && (
            <div className="mt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Changer l'image</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
