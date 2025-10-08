// Service de compression d'images pour optimiser les coûts Firebase Storage

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
}

export class ImageCompressionService {
  private static readonly DEFAULT_OPTIONS: Required<CompressionOptions> = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    maxSizeKB: 2000 // 2MB
  }

  /**
   * Compresse une image pour optimiser les coûts de stockage
   */
  static async compressImage(
    file: File, 
    options: CompressionOptions = {}
  ): Promise<File> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options }
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculer les nouvelles dimensions en gardant le ratio
        let { width, height } = img
        const maxWidth = opts.maxWidth
        const maxHeight = opts.maxHeight

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        // Configurer le canvas
        canvas.width = width
        canvas.height = height

        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, width, height)

        // Convertir en blob avec compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erreur lors de la compression'))
              return
            }

            // Vérifier la taille finale
            const sizeKB = blob.size / 1024
            if (sizeKB > opts.maxSizeKB) {
              // Recompresser avec une qualité plus faible
              const newQuality = Math.max(0.1, opts.quality * (opts.maxSizeKB / sizeKB))
              canvas.toBlob(
                (finalBlob) => {
                  if (!finalBlob) {
                    reject(new Error('Erreur lors de la recompression'))
                    return
                  }
                  resolve(new File([finalBlob], file.name, { type: 'image/jpeg' }))
                },
                'image/jpeg',
                newQuality
              )
            } else {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }))
            }
          },
          'image/jpeg',
          opts.quality
        )
      }

      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Estime le coût de stockage Firebase pour une image
   */
  static estimateStorageCost(fileSizeBytes: number): {
    storageCostPerMonth: number
    downloadCostPerMonth: number
    totalCostPerMonth: number
  } {
    const sizeGB = fileSizeBytes / (1024 * 1024 * 1024)
    
    // Tarifs Firebase Storage (2024)
    const storageCostPerGB = 0.026 // €/GB/mois
    const downloadCostPerGB = 0.12 // €/GB
    
    // Estimation : 10 téléchargements par mois par image
    const downloadsPerMonth = 10
    
    return {
      storageCostPerMonth: sizeGB * storageCostPerGB,
      downloadCostPerMonth: sizeGB * downloadCostPerGB * downloadsPerMonth,
      totalCostPerMonth: sizeGB * (storageCostPerGB + downloadCostPerGB * downloadsPerMonth)
    }
  }

  /**
   * Calcule les économies potentielles avec la compression
   */
  static calculateSavings(originalSize: number, compressedSize: number): {
    sizeReduction: number
    percentageReduction: number
    monthlySavings: number
  } {
    const sizeReduction = originalSize - compressedSize
    const percentageReduction = (sizeReduction / originalSize) * 100
    
    const originalCost = this.estimateStorageCost(originalSize).totalCostPerMonth
    const compressedCost = this.estimateStorageCost(compressedSize).totalCostPerMonth
    const monthlySavings = originalCost - compressedCost

    return {
      sizeReduction,
      percentageReduction,
      monthlySavings
    }
  }
}


