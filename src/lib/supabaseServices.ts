import { supabase } from './supabase'

// Types correspondant à la structure Supabase
export interface SupabaseClass {
  id?: string
  name: string
  teacher_id: string
  created_at?: string
}

export interface SupabaseStudent {
  id?: string
  name: string
  class_id: string
  created_at?: string
}

export interface SupabaseQuestion {
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
  created_at?: string
}

export interface SupabaseQuizResult {
  id?: string
  student_id: string
  question_id?: string
  class_id?: string
  teacher_id?: string
  is_correct: boolean
  score?: number
  total_questions?: number
  answers?: any[]
  created_at?: string
}

// Services pour les Classes
export const classService = {
  async create(classData: Omit<SupabaseClass, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('classes')
      .insert([classData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByTeacher(teacherId: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async update(id: string, updates: Partial<SupabaseClass>) {
    const { data, error } = await supabase
      .from('classes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Services pour les Étudiants
export const studentService = {
  async create(studentData: Omit<SupabaseStudent, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByClass(classId: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async update(id: string, updates: Partial<SupabaseStudent>) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Services pour les Questions
export const questionService = {
  async create(questionData: Omit<SupabaseQuestion, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('questions')
      .insert([questionData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByClass(classId: string) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async update(id: string, updates: Partial<SupabaseQuestion>) {
    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Services pour les Résultats de Quiz
export const quizResultService = {
  async create(resultData: Omit<SupabaseQuizResult, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert([resultData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByTeacher(teacherId: string) {
    // Récupérer tous les résultats via les étudiants des classes du professeur
    const classes = await classService.getByTeacher(teacherId)
    let allResults: any[] = []
    
    for (const classItem of classes) {
      const students = await studentService.getByClass(classItem.id!)
      for (const student of students) {
        const results = await this.getByStudent(student.id!)
        allResults.push(...results)
      }
    }
    
    return allResults
  },

  async getByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getByQuestion(questionId: string) {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('question_id', questionId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('quiz_results')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Service pour le stockage d'images (Supabase Storage)
export const imageService = {
  async uploadImage(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('question-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    
    const { data: urlData } = supabase.storage
      .from('question-images')
      .getPublicUrl(path)
    
    return urlData.publicUrl
  },

  async deleteImage(path: string) {
    const { error } = await supabase.storage
      .from('question-images')
      .remove([path])
    
    if (error) throw error
  }
}

