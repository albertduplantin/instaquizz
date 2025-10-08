export const storageService = {
  // Calculer la taille réelle du stockage utilisé par un utilisateur
  async calculateUserStorage(userId: string): Promise<number> {
    try {
      // Récupérer toutes les questions de l'utilisateur pour trouver les images
      const { questionService } = await import('./firebaseServices')
      const { classService } = await import('./firebaseServices')
      
      const classes = await classService.getByTeacher(userId)
      
      let totalSizeBytes = 0
      let imagesFound = 0
      
      for (const classItem of classes) {
        const questions = await questionService.getByClass(classItem.id!)
        
        for (const question of questions) {
          if (question.image_url) {
            const imageSize = await this.calculateImageSize(question.image_url)
            totalSizeBytes += imageSize * (1024 * 1024 * 1024) // Convertir GB en bytes
            imagesFound++
          }
        }
      }
      
      // Convertir en GB
      const totalSizeGB = totalSizeBytes / (1024 * 1024 * 1024)
      
      return totalSizeGB
    } catch (error: any) {
      console.error('Erreur lors du calcul du stockage:', error)
      
      // Gestion spécifique des erreurs de permissions
      if (error.code === 'permission-denied') {
        console.warn('Permissions insuffisantes pour calculer le stockage. Vérifiez les règles Firestore.')
        return 0
      }
      
      return 0
    }
  },

  // Calculer la taille d'une image spécifique
  async calculateImageSize(imageUrl: string): Promise<number> {
    try {
      // Si c'est une URL Supabase Storage, extraire le chemin
      if (imageUrl.includes('supabase')) {
        // Pour Supabase, on peut estimer la taille ou faire une requête HEAD
        const response = await fetch(imageUrl, { method: 'HEAD' })
        const contentLength = response.headers.get('content-length')
        if (contentLength) {
          const sizeGB = parseInt(contentLength) / (1024 * 1024 * 1024)
          return sizeGB
        }
      }
      
      // Pour les autres URLs, faire une requête HEAD pour obtenir la taille
      const response = await fetch(imageUrl, { method: 'HEAD' })
      const contentLength = response.headers.get('content-length')
      if (contentLength) {
        const sizeGB = parseInt(contentLength) / (1024 * 1024 * 1024)
        return sizeGB
      }
      return 0
    } catch (error) {
      console.warn('Impossible de calculer la taille de l\'image:', error)
      return 0
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