import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit
} from 'firebase/firestore'
import { auth, db } from './firebase'

// Types
export interface Teacher {
  id: string
  email: string
  name: string
  created_at: string
}

export interface Class {
  id: string
  name: string
  teacher_id: string
  created_at: string
}

export interface Student {
  id: string
  name: string
  class_id: string
  created_at: string
}

export interface Question {
  id: string
  content: string
  class_id: string
  teacher_id: string
  created_at: string
}

export interface QuizResult {
  id: string
  student_id: string
  question_id: string
  class_id: string
  is_correct: boolean
  created_at: string
}

// Authentification
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

export const signUp = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Créer le profil enseignant
    await addDoc(collection(db, 'teachers'), {
      id: userCredential.user.uid,
      email,
      name,
      created_at: new Date().toISOString()
    })
    
    return { user: userCredential.user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

export const signOutUser = async () => {
  try {
    await signOut(auth)
    return { error: null }
  } catch (error) {
    return { error }
  }
}

// Classes
export const createClass = async (name: string, teacherId: string) => {
  try {
    const docRef = await addDoc(collection(db, 'classes'), {
      name,
      teacher_id: teacherId,
      created_at: new Date().toISOString()
    })
    return { id: docRef.id, error: null }
  } catch (error) {
    return { id: null, error }
  }
}

export const getClasses = async (teacherId: string) => {
  try {
    const q = query(
      collection(db, 'classes'), 
      where('teacher_id', '==', teacherId),
      orderBy('created_at', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const classes = querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Class[]
    return { classes, error: null }
  } catch (error) {
    return { classes: [], error }
  }
}

// Étudiants
export const createStudent = async (name: string, classId: string) => {
  try {
    const docRef = await addDoc(collection(db, 'students'), {
      name,
      class_id: classId,
      created_at: new Date().toISOString()
    })
    return { id: docRef.id, error: null }
  } catch (error) {
    return { id: null, error }
  }
}

export const getStudents = async (classId: string) => {
  try {
    const q = query(
      collection(db, 'students'), 
      where('class_id', '==', classId),
      orderBy('created_at', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const students = querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Student[]
    return { students, error: null }
  } catch (error) {
    return { students: [], error }
  }
}

// Questions
export const createQuestion = async (content: string, classId: string, teacherId: string) => {
  try {
    const docRef = await addDoc(collection(db, 'questions'), {
      content,
      class_id: classId,
      teacher_id: teacherId,
      created_at: new Date().toISOString()
    })
    return { id: docRef.id, error: null }
  } catch (error) {
    return { id: null, error }
  }
}

export const getQuestions = async (classId: string) => {
  try {
    const q = query(
      collection(db, 'questions'), 
      where('class_id', '==', classId),
      orderBy('created_at', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const questions = querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Question[]
    return { questions, error: null }
  } catch (error) {
    return { questions: [], error }
  }
}

// Résultats de quiz
export const saveQuizResult = async (studentId: string, questionId: string, classId: string, isCorrect: boolean) => {
  try {
    const docRef = await addDoc(collection(db, 'quiz_results'), {
      student_id: studentId,
      question_id: questionId,
      class_id: classId,
      is_correct: isCorrect,
      created_at: new Date().toISOString()
    })
    return { id: docRef.id, error: null }
  } catch (error) {
    return { id: null, error }
  }
}

export const getQuizResults = async (classId: string, limitCount: number = 50) => {
  try {
    const q = query(
      collection(db, 'quiz_results'), 
      where('class_id', '==', classId),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    const results = querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as QuizResult[]
    return { results, error: null }
  } catch (error) {
    return { results: [], error }
  }
}
