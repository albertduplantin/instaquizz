import { db } from './firebase'
import { collection, doc, getDocs, setDoc, query, where, writeBatch } from 'firebase/firestore'
import type { Student } from '../types'

export interface InterrogationStats {
  student_id: string
  class_id: string
  total_interrogations: number
  last_interrogated: Date
  created_at: Date
  updated_at: Date
}

export interface WeightedStudent extends Student {
  weight: number
  interrogation_count: number
  last_interrogated: Date | null
}

class InterrogationService {
  private collectionName = 'interrogation_stats'

  /**
   * Enregistre une interrogation d'un élève
   */
  async recordInterrogation(studentId: string, classId: string): Promise<void> {
    try {
      const statsRef = doc(db, this.collectionName, `${studentId}_${classId}`)
      const now = new Date()
      
      // Récupérer les stats existantes
      const existingStats = await this.getInterrogationStats(studentId, classId)
      
      const stats: InterrogationStats = {
        student_id: studentId,
        class_id: classId,
        total_interrogations: (existingStats?.total_interrogations || 0) + 1,
        last_interrogated: now,
        created_at: existingStats?.created_at || now,
        updated_at: now
      }
      
      await setDoc(statsRef, stats)
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'interrogation:', error)
      throw error
    }
  }

  /**
   * Récupère les statistiques d'interrogation d'un élève
   */
  async getInterrogationStats(studentId: string, classId: string): Promise<InterrogationStats | null> {
    try {
      const statsDoc = await getDocs(query(collection(db, this.collectionName), where('student_id', '==', studentId), where('class_id', '==', classId)))
      
      if (statsDoc.empty) {
        return null
      }
      
      const data = statsDoc.docs[0].data()
      return {
        ...data,
        last_interrogated: data.last_interrogated?.toDate() || new Date(),
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date()
      } as InterrogationStats
    } catch (error) {
      console.error('Erreur lors de la récupération des stats d\'interrogation:', error)
      return null
    }
  }

  /**
   * Récupère les statistiques d'interrogation pour tous les élèves d'une classe
   */
  async getClassInterrogationStats(classId: string): Promise<Map<string, InterrogationStats>> {
    try {
      const statsQuery = query(
        collection(db, this.collectionName),
        where('class_id', '==', classId)
      )
      
      const statsSnapshot = await getDocs(statsQuery)
      const statsMap = new Map<string, InterrogationStats>()
      
      statsSnapshot.forEach(doc => {
        const data = doc.data()
        const stats: InterrogationStats = {
          ...data,
          last_interrogated: data.last_interrogated?.toDate() || new Date(),
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date()
        } as InterrogationStats
        
        statsMap.set(data.student_id, stats)
      })
      
      return statsMap
    } catch (error) {
      console.error('Erreur lors de la récupération des stats de classe:', error)
      return new Map()
    }
  }

  /**
   * Calcule les poids pour le tirage au sort intelligent
   * Plus un élève a été interrogé, moins il a de chances d'être tiré
   */
  calculateWeights(students: Student[], interrogationStats: Map<string, InterrogationStats>): WeightedStudent[] {
    const now = new Date()
    const maxInterrogations = Math.max(...Array.from(interrogationStats.values()).map(s => s.total_interrogations), 1)
    
    return students.map(student => {
      const stats = interrogationStats.get(student.id!) || {
        total_interrogations: 0,
        last_interrogated: null
      }
      
      // Calcul du poids basé sur :
      // 1. Nombre d'interrogations (inversement proportionnel)
      // 2. Temps depuis la dernière interrogation (plus c'est ancien, plus le poids est élevé)
      // 3. Bonus pour les élèves jamais interrogés
      
      let weight = 1
      
      // Bonus pour les élèves jamais interrogés
      if (stats.total_interrogations === 0) {
        weight = 10 // Poids très élevé pour les élèves jamais interrogés
      } else {
        // Poids inversement proportionnel au nombre d'interrogations
        weight = Math.max(1, maxInterrogations - stats.total_interrogations + 1)
        
        // Bonus temporel : plus c'est ancien, plus le poids est élevé
        if (stats.last_interrogated) {
          const daysSinceLastInterrogation = Math.floor((now.getTime() - stats.last_interrogated.getTime()) / (1000 * 60 * 60 * 24))
          weight += Math.min(daysSinceLastInterrogation, 7) // Bonus max de 7 jours
        }
      }
      
      return {
        ...student,
        weight,
        interrogation_count: stats.total_interrogations,
        last_interrogated: stats.last_interrogated
      }
    })
  }

  /**
   * Tire au sort un élève de manière intelligente
   */
  pickWeightedRandomStudent(weightedStudents: WeightedStudent[]): Student | null {
    if (weightedStudents.length === 0) return null
    
    // Calculer la somme totale des poids
    const totalWeight = weightedStudents.reduce((sum, student) => sum + student.weight, 0)
    
    if (totalWeight === 0) {
      // Si tous les poids sont 0, tirage aléatoire simple
      const randomIndex = Math.floor(Math.random() * weightedStudents.length)
      return weightedStudents[randomIndex]
    }
    
    // Tirage aléatoire pondéré
    let random = Math.random() * totalWeight
    let currentWeight = 0
    
    for (const student of weightedStudents) {
      currentWeight += student.weight
      if (random <= currentWeight) {
        return student
      }
    }
    
    // Fallback (ne devrait jamais arriver)
    return weightedStudents[weightedStudents.length - 1]
  }

  /**
   * Récupère les élèves d'une classe avec leurs statistiques d'interrogation
   */
  async getStudentsWithInterrogationStats(classId: string, students: Student[]): Promise<WeightedStudent[]> {
    const interrogationStats = await this.getClassInterrogationStats(classId)
    return this.calculateWeights(students, interrogationStats)
  }

  /**
   * Réinitialise les statistiques d'interrogation d'une classe
   */
  async resetClassInterrogationStats(classId: string): Promise<void> {
    try {
      const statsQuery = query(
        collection(db, this.collectionName),
        where('class_id', '==', classId)
      )
      
      const statsSnapshot = await getDocs(statsQuery)
      const batch = writeBatch(db)
      
      statsSnapshot.forEach(doc => {
        batch.delete(doc.ref)
      })
      
      await batch.commit()
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des stats d\'interrogation:', error)
      throw error
    }
  }
}

export const interrogationService = new InterrogationService()
