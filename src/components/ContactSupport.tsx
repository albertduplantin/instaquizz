import React, { useState } from 'react'
import { MessageCircle, AlertCircle, CheckCircle, Send } from 'lucide-react'
import { emailService, type ContactFormData } from '../lib/emailService'

// Interface déjà définie dans emailService.ts

export function ContactSupport() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Envoyer l'email via EmailJS
      const result = await emailService.sendContactEmail(formData)
      
      if (result.success) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          priority: 'medium'
        })
        
        // L'email principal est envoyé avec succès, pas besoin de confirmation séparée
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <MessageCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contactez le support</h2>
        <p className="text-gray-600">
          Nous sommes là pour vous aider ! Envoyez-nous un message et nous vous répondrons rapidement.
        </p>
      </div>

      {/* Informations de contact rapide */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8">
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <div>
            <p className="font-medium text-gray-900">Réponse</p>
            <p className="text-sm text-gray-600">Sous 24h en moyenne</p>
          </div>
        </div>
      </div>

      {/* Formulaire de contact */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre nom complet"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="votre@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Sujet *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Décrivez brièvement votre problème"
          />
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priorité
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Faible - Question générale</option>
            <option value="medium">Moyenne - Problème mineur</option>
            <option value="high">Élevée - Bug critique ou problème urgent</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Décrivez votre problème en détail. Plus vous donnez d'informations, plus nous pourrons vous aider rapidement."
          />
        </div>

        {/* Statut de soumission */}
        {submitStatus === 'success' && (
          <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800">Message envoyé avec succès ! Nous vous répondrons bientôt.</p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">Erreur lors de l'envoi. Veuillez réessayer ou nous contacter directement.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Envoi en cours...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Envoyer le message</span>
            </>
          )}
        </button>
      </form>

      {/* FAQ rapide */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Questions fréquentes</h3>
        <div className="space-y-3">
          <div>
            <p className="font-medium text-gray-900">Comment annuler mon abonnement ?</p>
            <p className="text-sm text-gray-600">Allez dans "Abonnement" → "Gérer mon abonnement" → "Annuler"</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Puis-je changer de plan à tout moment ?</p>
            <p className="text-sm text-gray-600">Oui, vous pouvez upgrader ou downgrader votre plan instantanément.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Mes données sont-elles sécurisées ?</p>
            <p className="text-sm text-gray-600">Absolument ! Nous utilisons Firebase avec un chiffrement de niveau bancaire.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
