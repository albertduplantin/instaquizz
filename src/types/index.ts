export interface User {
  id: string
  email?: string
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
  is_correct: boolean
  created_at: string
}

export interface StudentStats {
  id: string
  name: string
  total_questions: number
  correct_answers: number
  average: number
} 