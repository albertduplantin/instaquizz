export interface User {
  id: string
  email?: string
  displayName?: string
  photoURL?: string
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
  image_url?: string
  image_alt?: string
  links?: QuestionLink[]
}

export interface QuestionLink {
  id: string
  url: string
  title: string
  description?: string
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

// Types pour les abonnements
export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'premium' | 'enterprise'

export interface SubscriptionLimits {
  maxClasses: number
  maxStudentsPerClass: number
  maxQuestionsPerClass: number
  maxStorageGB: number
  features: string[]
}

export interface UserLimitsWithPlan extends SubscriptionLimits {
  planName: string
  nextBillingDate?: string
}

export interface UserSubscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: 'active' | 'inactive' | 'cancelled' | 'past_due'
  currentPeriodStart: string
  currentPeriodEnd: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  created_at: string
  updated_at: string
  cancelled_at?: string
  reactivated_at?: string
}

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan
  name: string
  price: number
  priceId: string
  priceIdAnnual?: string
  annualPrice?: number
  description: string
  limits: SubscriptionLimits
  popular?: boolean
  annualDiscount?: number
}

// Types pour l'administration
export interface AdminUser {
  id: string
  email: string
  displayName: string
  isAdmin: boolean
  created_at: string
  last_login: string
}

export interface AdminStats {
  totalUsers: number
  totalRevenue: number
  activeSubscriptions: number
  freeUsers: number
  paidUsers: number
  monthlyRevenue: number
}

export interface UserWithSubscription {
  id: string
  email: string
  displayName: string
  subscription: UserSubscription | null
  created_at: string
  last_login: string
  totalClasses: number
  totalStudents: number
  totalQuestions: number
} 