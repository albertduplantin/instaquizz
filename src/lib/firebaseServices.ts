import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  getMetadata 
} from 'firebase/storage'
import { db, storage } from './firebase'

// Types
export interface FirebaseClass {
  id?: string
  name: string
  teacher_id: string
  created_at: any
}

export interface FirebaseStudent {
  id?: string
  name: string
  class_id: string
  created_at: any
}

export interface FirebaseQuestion {
  id?: string
  content: string
  class_id: string
  teacher_id: string
  image_url?: string
  image_alt?: string
  links?: Array<{
    id: string
    url: string
    title: string
    description?: string
  }>
  created_at: any
}

export interface FirebaseQuizResult {
  id?: string
  student_id: string
  class_id: string
  teacher_id: string
  score: number
  total_questions: number
  answers: any[]
  created_at: any
}

// Services pour les Classes
export const classService = {
  async create(classData: Omit<FirebaseClass, 'id'>) {
    const docRef = await addDoc(collection(db, 'classes'), classData)
    return { id: docRef.id, ...classData }
  },

  async getByTeacher(teacherId: string) {
    const q = query(
      collection(db, 'classes'),
      where('teacher_id', '==', teacherId)
    )
    const snapshot = await getDocs(q)
    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseClass & { id: string }))
    // Trier côté client pour éviter le besoin d'index composite
    return classes.sort((a, b) => {
      const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at)
      const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at)
      return dateB.getTime() - dateA.getTime()
    })
  },

  async update(id: string, data: Partial<FirebaseClass>) {
    await updateDoc(doc(db, 'classes', id), data)
  },

  async delete(id: string) {
    await deleteDoc(doc(db, 'classes', id))
  }
}

// Services pour les Étudiants
export const studentService = {
  async create(studentData: Omit<FirebaseStudent, 'id'>) {
    const docRef = await addDoc(collection(db, 'students'), studentData)
    return { id: docRef.id, ...studentData }
  },

  async getByClass(classId: string) {
    const q = query(
      collection(db, 'students'),
      where('class_id', '==', classId)
    )
    const snapshot = await getDocs(q)
    const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseStudent & { id: string }))
    // Trier côté client pour éviter le besoin d'index composite
    return students.sort((a, b) => {
      const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at)
      const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at)
      return dateB.getTime() - dateA.getTime()
    })
  },

  async update(id: string, data: Partial<FirebaseStudent>) {
    await updateDoc(doc(db, 'students', id), data)
  },

  async delete(id: string) {
    await deleteDoc(doc(db, 'students', id))
  }
}

// Services pour les Questions
export const questionService = {
  async create(questionData: Omit<FirebaseQuestion, 'id'>) {
    const docRef = await addDoc(collection(db, 'questions'), questionData)
    return { id: docRef.id, ...questionData }
  },

  async getByClass(classId: string) {
    const q = query(
      collection(db, 'questions'),
      where('class_id', '==', classId)
    )
    const snapshot = await getDocs(q)
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseQuestion & { id: string }))
    // Trier côté client pour éviter le besoin d'index composite
    return questions.sort((a, b) => {
      const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at)
      const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at)
      return dateB.getTime() - dateA.getTime()
    })
  },

  async update(id: string, data: Partial<FirebaseQuestion>) {
    await updateDoc(doc(db, 'questions', id), data)
  },

  async delete(id: string) {
    await deleteDoc(doc(db, 'questions', id))
  }
}

// Services pour les Résultats de Quiz
export const quizResultService = {
  async create(resultData: Omit<FirebaseQuizResult, 'id'>) {
    const docRef = await addDoc(collection(db, 'quiz_results'), resultData)
    return { id: docRef.id, ...resultData }
  },

  async getByTeacher(teacherId: string) {
    const q = query(
      collection(db, 'quiz_results'),
      where('teacher_id', '==', teacherId)
    )
    const snapshot = await getDocs(q)
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseQuizResult))
    // Trier côté client pour éviter le besoin d'index composite
    return results.sort((a, b) => {
      const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at)
      const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at)
      return dateB.getTime() - dateA.getTime()
    })
  },

  async delete(id: string) {
    await deleteDoc(doc(db, 'quiz_results', id))
  }
}

// Services pour le Stockage d'Images
export const imageService = {
  async uploadImage(file: File, path: string) {
    const imageRef = ref(storage, path)
    const snapshot = await uploadBytes(imageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  },

  async deleteImage(path: string) {
    const imageRef = ref(storage, path)
    await deleteObject(imageRef)
  },

  async getImageSize(path: string): Promise<number> {
    try {
      const imageRef = ref(storage, path)
      const metadata = await getMetadata(imageRef)
      return metadata.size // Retourne la taille en bytes
    } catch (error) {
      console.warn('Impossible de récupérer les métadonnées de l\'image:', error)
      return 0
    }
  },

  // Extraire le chemin d'une URL Firebase Storage
  extractPathFromUrl(url: string): string | null {
    try {
      // Format: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile?token=...
      const match = url.match(/\/o\/(.+?)\?/)
      if (match) {
        return decodeURIComponent(match[1])
      }
      return null
    } catch (error) {
      console.warn('Impossible d\'extraire le chemin de l\'URL:', error)
      return null
    }
  }
}