import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, Zap } from 'lucide-react'
import { imageService } from '../lib/supabaseServices'
import { ImageCompressionService } from '../lib/imageCompression'
import { storageService } from '../lib/storageService'
import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { limitsService } from '../lib/subscriptionService'

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string, imageAlt: string) => void
  onImageRemoved: () => void
  currentImageUrl?: string
  currentImageAlt?: string
  disabled?: boolean
  onStorageLimitReached?: (limitData: any) => void
}

export function ImageUpload({ 
  onImageUploaded, 
  onImageRemoved, 
  currentImageUrl, 
  currentImageAlt,
  disabled = false,
  onStorageLimitReached
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useSupabaseAuth()

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit avant compression
      alert('L\'image doit faire moins de 5MB')
      return
    }

    if (!user) {
      alert('Vous devez être connecté pour uploader une image')
      return
    }

    setIsCompressing(true)
    try {
      // Compresser l'image pour optimiser les coûts
      const compressedFile = await ImageCompressionService.compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        maxSizeKB: 2000
      })

      
      // Vérifier les limites de stockage
      const userLimits = await limitsService.getUserLimits(user.id)
      const storageCheck = await storageService.canAddFile(user.id, compressedFile.size, userLimits.maxStorageGB)
      
      if (!storageCheck.allowed) {
        if (onStorageLimitReached) {
          onStorageLimitReached({
            limitType: 'storage',
            currentCount: storageCheck.currentUsedGB || 0,
            maxCount: storageCheck.maxStorageGB || 0,
            planName: 'Votre plan actuel'
          })
        } else {
          alert(storageCheck.reason || 'Limite de stockage atteinte')
        }
        setIsCompressing(false)
        return
      }
      
      setIsCompressing(false)
      setIsUploading(true)
      
      // Générer un nom de fichier unique
      const fileExt = 'jpg' // Toujours JPG après compression
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `question-images/${fileName}`

      // Upload vers Firebase Storage
      const imageUrl = await imageService.uploadImage(compressedFile, filePath)
      
      onImageUploaded(imageUrl, file.name)
    } catch (error) {
      console.error('Erreur lors de la compression/upload:', error)
      alert('Erreur lors du traitement de l\'image')
    } finally {
      setIsCompressing(false)
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

  return (
    <div className="space-y-4">
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
          
          {isCompressing ? (
            <div className="flex flex-col items-center space-y-2">
              <Zap className="h-8 w-8 text-orange-600 animate-pulse" />
              <p className="text-sm text-gray-600">Compression en cours...</p>
            </div>
          ) : isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600">Upload en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                <p className="font-medium">Cliquez ou glissez-déposez une image</p>
                <p className="text-xs">PNG, JPG, GIF jusqu'à 5MB (compressé automatiquement)</p>
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
