export const storageService = {
  // Calculer la taille réelle du stockage utilisé par un utilisateur
  async calculateUserStorage(userId: string): Promise<number> {
    try {
      console.log('🔍 Calcul du stockage pour l\'utilisateur:', userId)
      
      // Récupérer toutes les questions de l'utilisateur pour trouver les images
      const { questionService } = await import('./firebaseServices')
      const { classService } = await import('./firebaseServices')
      
      const classes = await classService.getByTeacher(userId)
      console.log(`📚 ${classes.length} classes trouvées`)
      
      let totalSizeGB = 0
      let imagesFound = 0
      
      for (const classItem of classes) {
        const questions = await questionService.getByClass(classItem.id!)
        console.log(`❓ ${questions.length} questions dans la classe "${classItem.name}"`)
        
        for (const question of questions) {
          if (question.image_url) {
            const imageSizeGB = await this.calculateImageSize(question.image_url)
            totalSizeGB += imageSizeGB
            imagesFound++
          }
        }
      }
      
      const totalSizeMB = totalSizeGB * 1024
      console.log(`📊 Résultat final: ${imagesFound} images, ${totalSizeMB.toFixed(2)}MB (${totalSizeGB.toFixed(4)}GB)`)
      
      return totalSizeGB
    } catch (error: any) {
      console.error('❌ Erreur lors du calcul du stockage:', error)
      
      // Gestion spécifique des erreurs de permissions
      if (error.code === 'permission-denied') {
        console.warn('⚠️ Permissions insuffisantes pour calculer le stockage. Vérifiez les règles Firestore.')
        return 0
      }
      
      return 0
    }
  },

  // Calculer la taille d'une image spécifique
  async calculateImageSize(imageUrl: string): Promise<number> {
    try {
      console.log('📊 Calcul de la taille pour:', imageUrl)
      
      // Pour Firebase Storage, utiliser l'API Firebase pour éviter les problèmes CORS
      if (imageUrl.includes('firebasestorage.googleapis.com')) {
        const { imageService } = await import('./firebaseServices')
        const path = imageService.extractPathFromUrl(imageUrl)
        
        console.log('📂 Chemin extrait:', path)
        
        if (path) {
          const sizeBytes = await imageService.getImageSize(path)
          const sizeGB = sizeBytes / (1024 * 1024 * 1024)
          const sizeMB = sizeBytes / (1024 * 1024)
          
          console.log(`✅ Taille récupérée: ${sizeMB.toFixed(2)}MB (${sizeGB.toFixed(6)}GB)`)
          return sizeGB
        } else {
          console.warn('⚠️ Impossible d\'extraire le chemin de l\'URL')
        }
      }
      
      // Pour Supabase Storage ou autres, estimer une taille moyenne
      // (on évite fetch qui cause des erreurs CORS)
      if (imageUrl.includes('supabase')) {
        console.log('📦 Supabase Storage détecté, estimation 500KB')
        // Estimation : ~500KB après compression
        return 0.0005 // 0.5MB en GB
      }
      
      // Par défaut, estimer ~500KB
      console.log('⚠️ Source inconnue, estimation 500KB')
      return 0.0005
    } catch (error) {
      console.error('❌ Erreur lors du calcul de la taille de l\'image:', error)
      // En cas d'erreur, estimer ~500KB
      return 0.0005
    }
  },

  // Mettre à jour le stockage d'un utilisateur après ajout/suppression d'image
  async updateUserStorage(userId: string): Promise<number> {
    return await this.calculateUserStorage(userId)
  },

  // Vérifier si l'utilisateur peut ajouter un fichier
  async canAddFile(userId: string, fileSizeBytes: number, maxStorageGB: number): Promise<{ 
    allowed: boolean; 
    reason?: string; 
    currentUsedGB: number;
    maxStorageGB: number;
  }> {
    try {
      const currentStorageGB = await this.calculateUserStorage(userId)
      const fileSizeGB = fileSizeBytes / (1024 * 1024 * 1024)
      const newTotalGB = currentStorageGB + fileSizeGB

      if (maxStorageGB === -1) {
        return { 
          allowed: true, 
          currentUsedGB: currentStorageGB,
          maxStorageGB: -1
        } // Stockage illimité
      }

      if (newTotalGB > maxStorageGB) {
        return { 
          allowed: false, 
          reason: `Stockage insuffisant. Utilisé: ${currentStorageGB.toFixed(2)}GB, Fichier: ${fileSizeGB.toFixed(2)}GB, Limite: ${maxStorageGB}GB`,
          currentUsedGB: currentStorageGB,
          maxStorageGB: maxStorageGB
        }
      }

      return { 
        allowed: true,
        currentUsedGB: currentStorageGB,
        maxStorageGB: maxStorageGB
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du stockage:', error)
      return { 
        allowed: false, 
        reason: 'Erreur lors de la vérification du stockage',
        currentUsedGB: 0,
        maxStorageGB: maxStorageGB
      }
    }
  }
}