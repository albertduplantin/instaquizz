import emailjs from '@emailjs/browser'

// Configuration EmailJS
const EMAILJS_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'JAIXdbNddgWKDIX0e',
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_19zoh2l',
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_p7y3zuo'
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high'
}

export const emailService = {
  // Initialiser EmailJS
  init() {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY)
  },

  // Envoyer un email de contact
  async sendContactEmail(formData: ContactFormData): Promise<{ success: boolean; message: string }> {
    try {
      // Initialiser EmailJS si pas déjà fait
      this.init()

      // Préparer les données pour le template
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority,
        to_email: 'albertduplantin@gmail.com', // Votre email de support
        reply_to: formData.email
      }

      // Envoyer l'email
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      )

      
      return {
        success: true,
        message: 'Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.'
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error)
      
      return {
        success: false,
        message: 'Erreur lors de l\'envoi du message. Veuillez réessayer ou nous contacter directement à support@instaquizz.com'
      }
    }
  },

  // Fonction de confirmation supprimée - l'email principal suffit
}
