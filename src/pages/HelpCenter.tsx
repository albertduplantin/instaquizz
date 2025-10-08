import { useState } from 'react'
import { ArrowLeft, BookOpen, Search, ChevronRight, HelpCircle } from 'lucide-react'
import { Documentation } from './Documentation'

interface HelpCenterProps {
  onPageChange: (page: string) => void
}

export function HelpCenter({ onPageChange }: HelpCenterProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'documentation' | 'faq'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<Set<string>>(new Set())

  const faqData = [
    {
      category: 'Démarrage',
      questions: [
        {
          question: 'Comment créer mon premier compte InstaQuizz ?',
          answer: 'Rendez-vous sur la page d\'accueil, cliquez sur "Se connecter" puis "Créer un compte". Entrez votre email et mot de passe, vérifiez votre email si nécessaire, puis choisissez votre plan d\'abonnement selon vos besoins.'
        },
        {
          question: 'Quel plan choisir pour commencer ?',
          answer: 'Le plan gratuit permet de tester l\'application avec 1 classe et 30 élèves. C\'est parfait pour découvrir InstaQuizz. Vous pourrez toujours changer de plan plus tard selon vos besoins.'
        },
        {
          question: 'Comment créer ma première classe ?',
          answer: 'Allez dans la section "Classes", cliquez sur "Créer une classe", entrez le nom de votre classe (ex: "6ème A", "Terminale S"), ajoutez une description optionnelle, puis cliquez sur "Créer" pour valider.'
        }
      ]
    },
    {
      category: 'Gestion des élèves',
      questions: [
        {
          question: 'Comment ajouter mes élèves ?',
          answer: 'Sélectionnez votre classe, cliquez sur "Ajouter un élève", entrez le prénom et nom de l\'élève, puis répétez pour tous vos élèves. Vous pouvez aussi utiliser "Ajouter plusieurs élèves" pour aller plus vite.'
        },
        {
          question: 'Puis-je importer une liste d\'élèves ?',
          answer: 'Oui ! Préparez un fichier CSV avec les colonnes "Prénom" et "Nom", puis cliquez sur "Importer depuis CSV" dans la section Classes. Vérifiez la prévisualisation et confirmez l\'import.'
        },
        {
          question: 'Comment modifier les informations d\'un élève ?',
          answer: 'Trouvez l\'élève dans la liste de votre classe, cliquez sur l\'icône "Modifier" à côté de son nom, changez le prénom ou nom, puis sauvegardez les modifications.'
        }
      ]
    },
    {
      category: 'Questions et quiz',
      questions: [
        {
          question: 'Comment créer des questions ?',
          answer: 'Allez dans la section "Questions", sélectionnez la classe concernée, cliquez sur "Créer une question", tapez votre question, ajoutez une image si nécessaire, puis sauvegardez. Commencez par 5-10 questions pour tester.'
        },
        {
          question: 'Puis-je ajouter des images aux questions ?',
          answer: 'Oui ! Lors de la création d\'une question, cliquez sur "Ajouter une image", sélectionnez une image (JPG, PNG). L\'image sera automatiquement compressée pour optimiser l\'espace de stockage.'
        },
        {
          question: 'Comment lancer un quiz ?',
          answer: 'Allez dans la section "Quiz", sélectionnez une classe, vérifiez que vous avez des élèves et des questions, cliquez sur "Démarrer le tirage au sort". Un élève et une question seront tirés au sort automatiquement.'
        },
        {
          question: 'Comment fonctionne le timer de questions ?',
          answer: 'Le timer est configuré à 10 secondes par défaut. Il affiche un cercle de progression avec des couleurs qui changent : vert (10-7s), orange (6-4s), rouge (3-0s). Vous pouvez l\'arrêter manuellement à tout moment.'
        }
      ]
    },
    {
      category: 'Statistiques et résultats',
      questions: [
        {
          question: 'Comment voir les résultats de mes élèves ?',
          answer: 'Allez dans la section "Résultats". Vous verrez un tableau avec tous vos élèves, leur nombre de questions totales, bonnes réponses, et pourcentage de réussite. Vous pouvez filtrer par classe.'
        },
        {
          question: 'Puis-je exporter les résultats ?',
          answer: 'Oui ! Dans la section "Résultats", cliquez sur "Exporter en CSV" pour télécharger un fichier Excel/Google Sheets, ou "Copier" pour coller les données ailleurs.'
        },
        {
          question: 'Comment modifier les résultats d\'un élève ?',
          answer: 'Dans la section "Résultats", cliquez sur "Modifier" à côté du nom de l\'élève, changez le nombre de questions totales ou bonnes réponses, puis sauvegardez. C\'est utile pour corriger des erreurs.'
        }
      ]
    },
    {
      category: 'Abonnements et limites',
      questions: [
        {
          question: 'Quels sont les plans disponibles ?',
          answer: 'Gratuit (0€) : 1 classe, 30 élèves, 50 questions, 100MB. Basic (1,49€) : 3 classes, 30 élèves, 140 questions, 500MB. Pro (4,99€) : 20 classes, 30 élèves, 1000 questions, 2GB. Premium (6,99€) : 50 classes, 30 élèves, 2000 questions, 5GB. Enterprise (12,99€) : illimité.'
        },
        {
          question: 'Comment changer de plan ?',
          answer: 'Allez dans la section "Abonnement", consultez votre plan actuel, choisissez un nouveau plan, suivez les instructions de paiement. Votre plan sera mis à jour immédiatement.'
        },
        {
          question: 'Que se passe-t-il si je dépasse mes limites ?',
          answer: 'Vous verrez des alertes sur votre tableau de bord quand vous approchez des limites. Pour dépasser, vous devrez upgrader votre plan. Le système vous guidera vers la page d\'abonnement.'
        },
        {
          question: 'Puis-je downgrader mon plan ?',
          answer: 'Oui, mais vous devrez d\'abord ajuster votre contenu pour respecter les nouvelles limites. Le système vérifiera automatiquement et vous guidera pour faire le ménage si nécessaire.'
        }
      ]
    },
    {
      category: 'Problèmes techniques',
      questions: [
        {
          question: 'L\'application ne se charge pas, que faire ?',
          answer: 'Vérifiez votre connexion internet, rafraîchissez la page (F5), videz le cache de votre navigateur, ou essayez en navigation privée. Si le problème persiste, contactez le support.'
        },
        {
          question: 'Mes données ont disparu, est-ce normal ?',
          answer: 'Non, vos données sont sauvegardées automatiquement. Vérifiez que vous êtes connecté avec le bon compte. Si le problème persiste, contactez immédiatement le support.'
        },
        {
          question: 'L\'application est lente, comment l\'optimiser ?',
          answer: 'Fermez les autres onglets, vérifiez votre connexion internet, redémarrez votre navigateur. Si vous avez beaucoup d\'images, considérez les compresser avant de les ajouter.'
        },
        {
          question: 'Comment contacter le support ?',
          answer: 'Vous pouvez nous contacter via notre chaîne YouTube Albert Duplantin, ou utiliser le formulaire de contact dans la section Support de l\'application.'
        }
      ]
    }
  ]

  const toggleFaq = (faqId: string) => {
    const newExpanded = new Set(expandedFaq)
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId)
    } else {
      newExpanded.add(faqId)
    }
    setExpandedFaq(newExpanded)
  }

  const filteredFaq = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Centre d'aide InstaQuizz
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Trouvez rapidement l'aide dont vous avez besoin pour maîtriser InstaQuizz
        </p>
      </div>

      {/* Mode d'emploi rapide */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">
            🎯 Concept pédagogique d'InstaQuizz
          </h2>
          <p className="text-blue-800 text-lg">
            Renforcez les connaissances de vos élèves par la répétition intelligente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Fin de cours */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Fin de cours</h3>
            </div>
            <p className="text-gray-700 mb-4">
              À la fin de chaque cours, ajoutez rapidement les questions que vous venez de traiter avec vos élèves.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Questions vues dans le cours du jour</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Ajout d'images pour illustrer</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Association à la classe concernée</span>
              </li>
            </ul>
          </div>

          {/* Début de cours */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Début de cours</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Au début de chaque cours, interrogez vos élèves sur les questions vues depuis le début de l'année.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Tirage au sort équitable des élèves</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Questions de toute l'année</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Calcul automatique des moyennes</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Avantages pédagogiques */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            🧠 Avantages pédagogiques
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔄</span>
              </div>
              <h5 className="font-semibold text-gray-900 mb-2">Répétition espacée</h5>
              <p className="text-sm text-gray-600">
                Les élèves revoient régulièrement les notions pour une meilleure mémorisation
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h5 className="font-semibold text-gray-900 mb-2">Rapidité</h5>
              <p className="text-sm text-gray-600">
                Quelques minutes suffisent pour interroger et évaluer toute la classe
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <h5 className="font-semibold text-gray-900 mb-2">Suivi des progrès</h5>
              <p className="text-sm text-gray-600">
                Moyennes automatiques et statistiques pour suivre l'évolution
              </p>
            </div>
          </div>
        </div>

        {/* Workflow complet */}
        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            📋 Workflow complet
          </h4>
          <div className="flex flex-wrap justify-center items-center space-x-4 text-sm">
            <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">1</span>
              <span className="text-gray-700">Créer vos classes</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">2</span>
              <span className="text-gray-700">Ajouter vos élèves</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">3</span>
              <span className="text-gray-700">Fin de cours : ajouter questions</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">4</span>
              <span className="text-gray-700">Début de cours : interroger</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">5</span>
              <span className="text-gray-700">Suivre les moyennes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher dans l'aide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Sections principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => setActiveSection('documentation')}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Documentation
          </h3>
          <p className="text-gray-600 mb-4">
            Guides détaillés pour utiliser toutes les fonctionnalités d'InstaQuizz
          </p>
          <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
            <span>Explorer</span>
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => setActiveSection('faq')}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
        >
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <HelpCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Questions fréquentes
          </h3>
          <p className="text-gray-600 mb-4">
            Trouvez rapidement les réponses aux questions les plus courantes
          </p>
          <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
            <span>Consulter</span>
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Questions fréquentes rapides */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
          Questions rapides
        </h2>
        <div className="space-y-4">
          {[
            'Comment créer ma première classe ?',
            'Puis-je importer une liste d\'élèves ?',
            'Comment ajouter des images aux questions ?',
            'Quels sont les différents plans d\'abonnement ?',
            'Comment exporter les résultats ?'
          ].map((question, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => setActiveSection('faq')}>
              <span className="text-gray-700">{question}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderDocumentation = () => (
    <Documentation onPageChange={onPageChange} />
  )

  const renderFaq = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questions fréquentes</h1>
          <p className="text-gray-600">Trouvez rapidement les réponses à vos questions</p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour
        </button>
      </div>

      {/* Barre de recherche FAQ */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher dans les FAQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* FAQ par catégorie */}
      <div className="space-y-8">
        {filteredFaq.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">
                {categoryIndex + 1}
              </div>
              {category.category}
            </h2>
            
            <div className="space-y-4">
              {category.questions.map((faq, faqIndex) => {
                const faqId = `${categoryIndex}-${faqIndex}`
                const isExpanded = expandedFaq.has(faqId)
                
                return (
                  <div key={faqIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleFaq(faqId)}
                      className="w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                      <ChevronRight 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>
                    
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
                        <p className="text-gray-700 leading-relaxed pt-4">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredFaq.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun résultat trouvé</h3>
          <p className="text-gray-600 mb-4">
            Aucune question ne correspond à votre recherche "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Effacer la recherche
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'documentation' && renderDocumentation()}
        {activeSection === 'faq' && renderFaq()}
      </div>
    </div>
  )
}
