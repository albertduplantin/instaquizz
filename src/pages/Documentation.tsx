import { useState } from 'react'
import { ArrowLeft, ChevronRight, CheckCircle, Info, Users, HelpCircle, BarChart3, CreditCard, Eye, EyeOff, BookOpen } from 'lucide-react'

interface DocumentationProps {
  onPageChange: (page: string) => void
}

export function Documentation({ }: DocumentationProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())

  const toggleStep = (stepIndex: number) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepIndex)) {
      newExpanded.delete(stepIndex)
    } else {
      newExpanded.add(stepIndex)
    }
    setExpandedSteps(newExpanded)
  }

  const documentationSections = [
    {
      id: 'getting-started',
      title: 'Démarrage rapide',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      content: {
        overview: 'Commencez votre aventure avec InstaQuizz en suivant ce guide étape par étape.',
        steps: [
          {
            title: 'Créer votre compte',
            description: 'Inscrivez-vous et choisissez votre plan d\'abonnement',
            details: [
              'Rendez-vous sur la page d\'accueil d\'InstaQuizz',
              'Cliquez sur "Se connecter" puis "Créer un compte"',
              'Entrez votre email et mot de passe',
              'Vérifiez votre email si nécessaire',
              'Choisissez votre plan d\'abonnement selon vos besoins'
            ],
            tips: [
              'Le plan gratuit permet de tester l\'application avec 1 classe et 30 élèves',
              'Vous pouvez changer de plan à tout moment depuis la page Abonnement'
            ]
          },
          {
            title: 'Créer votre première classe',
            description: 'Organisez vos cours en créant des classes distinctes',
            details: [
              'Allez dans la section "Classes"',
              'Cliquez sur "Créer une classe"',
              'Entrez le nom de votre classe (ex: "6ème A", "Terminale S")',
              'Ajoutez une description optionnelle',
              'Cliquez sur "Créer" pour valider'
            ],
            tips: [
              'Vous pouvez créer plusieurs classes pour différents niveaux',
              'Chaque classe est indépendante avec ses propres élèves et questions'
            ]
          },
          {
            title: 'Ajouter vos élèves',
            description: 'Remplissez votre classe avec la liste de vos étudiants',
            details: [
              'Sélectionnez la classe créée',
              'Cliquez sur "Ajouter un élève"',
              'Entrez le prénom et nom de l\'élève',
              'Répétez pour tous vos élèves',
              'Utilisez "Ajouter plusieurs élèves" pour aller plus vite'
            ],
            tips: [
              'Vous pouvez importer une liste d\'élèves depuis un fichier CSV',
              'Les noms peuvent être modifiés à tout moment'
            ]
          },
          {
            title: 'Créer vos premières questions',
            description: 'Construisez votre banque de questions par classe',
            details: [
              'Allez dans la section "Questions"',
              'Sélectionnez la classe concernée',
              'Cliquez sur "Créer une question"',
              'Tapez votre question',
              'Ajoutez une image si nécessaire',
              'Sauvegardez la question'
            ],
            tips: [
              'Commencez par 5-10 questions pour tester',
              'Vous pouvez ajouter des images pour rendre les questions plus attractives',
              'Les questions sont automatiquement sauvegardées'
            ]
          },
          {
            title: 'Lancer votre premier quiz',
            description: 'Testez le système de quiz instantané',
            details: [
              'Allez dans la section "Quiz"',
              'Sélectionnez une classe',
              'Vérifiez que vous avez des élèves et des questions',
              'Cliquez sur "Démarrer le tirage au sort"',
              'Évaluez la réponse de l\'élève sélectionné',
              'Continuez avec d\'autres questions'
            ],
            tips: [
              'Le système tire au sort un élève ET une question',
              'Vous pouvez voir les statistiques en temps réel',
              'Tout est sauvegardé automatiquement'
            ]
          }
        ]
      }
    },
    {
      id: 'classes-management',
      title: 'Gestion des classes',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      content: {
        overview: 'Maîtrisez la gestion complète de vos classes et de leurs paramètres.',
        features: [
          {
            title: 'Création de classes',
            description: 'Créez et organisez vos différentes classes',
            steps: [
              'Cliquez sur "Créer une classe"',
              'Remplissez le nom de la classe',
              'Ajoutez une description (optionnel)',
              'Choisissez une couleur de thème (optionnel)',
              'Validez la création'
            ]
          },
          {
            title: 'Modification des classes',
            description: 'Modifiez les informations de vos classes existantes',
            steps: [
              'Sélectionnez la classe à modifier',
              'Cliquez sur l\'icône "Modifier"',
              'Changez le nom ou la description',
              'Sauvegardez les modifications'
            ]
          },
          {
            title: 'Suppression de classes',
            description: 'Supprimez définitivement une classe et toutes ses données',
            steps: [
              'Sélectionnez la classe à supprimer',
              'Cliquez sur "Supprimer la classe"',
              'Confirmez la suppression',
              'Toutes les données (élèves, questions, résultats) seront supprimées'
            ]
          },
          {
            title: 'Archivage de classes',
            description: 'Archivez une classe sans supprimer les données',
            steps: [
              'Sélectionnez la classe à archiver',
              'Cliquez sur "Archiver"',
              'La classe sera masquée mais les données conservées',
              'Vous pourrez la réactiver plus tard'
            ]
          }
        ]
      }
    },
    {
      id: 'students-management',
      title: 'Gestion des élèves',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      content: {
        overview: 'Apprenez à gérer efficacement vos listes d\'élèves.',
        features: [
          {
            title: 'Ajout d\'élèves',
            description: 'Ajoutez des élèves individuellement ou en masse',
            methods: [
              {
                name: 'Ajout individuel',
                steps: [
                  'Sélectionnez la classe',
                  'Cliquez sur "Ajouter un élève"',
                  'Entrez le prénom et nom',
                  'Validez l\'ajout'
                ]
              },
              {
                name: 'Ajout en masse',
                steps: [
                  'Cliquez sur "Ajouter plusieurs élèves"',
                  'Tapez un élève par ligne',
                  'Format: "Prénom Nom"',
                  'Cliquez sur "Ajouter tous"'
                ]
              },
              {
                name: 'Import CSV',
                steps: [
                  'Préparez un fichier CSV avec colonnes: Prénom, Nom',
                  'Cliquez sur "Importer depuis CSV"',
                  'Sélectionnez votre fichier',
                  'Vérifiez la prévisualisation',
                  'Confirmez l\'import'
                ]
              }
            ]
          },
          {
            title: 'Modification des élèves',
            description: 'Modifiez les informations des élèves existants',
            steps: [
              'Trouvez l\'élève dans la liste',
              'Cliquez sur l\'icône "Modifier"',
              'Changez le prénom ou nom',
              'Sauvegardez les modifications'
            ]
          },
          {
            title: 'Suppression d\'élèves',
            description: 'Supprimez un élève et ses résultats',
            steps: [
              'Sélectionnez l\'élève à supprimer',
              'Cliquez sur "Supprimer"',
              'Confirmez la suppression',
              'Tous les résultats de l\'élève seront supprimés'
            ]
          }
        ]
      }
    },
    {
      id: 'questions-management',
      title: 'Gestion des questions',
      icon: HelpCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      content: {
        overview: 'Créez et organisez efficacement vos questions avec images.',
        features: [
          {
            title: 'Création de questions',
            description: 'Créez des questions texte ou avec images',
            types: [
              {
                name: 'Question texte simple',
                steps: [
                  'Sélectionnez la classe',
                  'Cliquez sur "Créer une question"',
                  'Tapez votre question',
                  'Sauvegardez'
                ]
              },
              {
                name: 'Question avec image',
                steps: [
                  'Créez une question texte',
                  'Cliquez sur "Ajouter une image"',
                  'Sélectionnez une image (JPG, PNG)',
                  'L\'image sera automatiquement compressée',
                  'Sauvegardez la question'
                ]
              }
            ]
          },
          {
            title: 'Organisation des questions',
            description: 'Organisez vos questions par thèmes ou difficulté',
            tips: [
              'Utilisez des descriptions claires',
              'Groupez les questions par chapitre',
              'Variez les types de questions',
              'Testez régulièrement vos questions'
            ]
          },
          {
            title: 'Modification des questions',
            description: 'Modifiez le contenu de vos questions existantes',
            steps: [
              'Trouvez la question à modifier',
              'Cliquez sur "Modifier"',
              'Changez le texte ou l\'image',
              'Sauvegardez les modifications'
            ]
          },
          {
            title: 'Suppression de questions',
            description: 'Supprimez les questions obsolètes',
            steps: [
              'Sélectionnez la question à supprimer',
              'Cliquez sur "Supprimer"',
              'Confirmez la suppression',
              'La question sera définitivement supprimée'
            ]
          }
        ]
      }
    },
    {
      id: 'quiz-system',
      title: 'Système de quiz',
      icon: BarChart3,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      content: {
        overview: 'Maîtrisez le système de quiz instantané et ses fonctionnalités avancées.',
        features: [
          {
            title: 'Quiz instantané',
            description: 'Lancez des quiz avec tirage au sort équitable',
            process: [
              'Sélectionnez une classe',
              'Vérifiez la disponibilité des élèves et questions',
              'Cliquez sur "Démarrer le tirage au sort"',
              'Un élève et une question sont tirés au sort',
              'Évaluez la réponse (correcte/incorrecte)',
              'Continuez avec d\'autres tirages'
            ]
          },
          {
            title: 'Sélection manuelle',
            description: 'Choisissez manuellement un élève ou une question',
            options: [
              'Sélectionnez un élève dans la liste déroulante',
              'Choisissez une question spécifique',
              'Lancez le quiz avec ces paramètres'
            ]
          },
          {
            title: 'Timer de questions',
            description: 'Utilisez le timer pour limiter le temps de réponse',
            features: [
              'Timer configurable (10 secondes par défaut)',
              'Animation visuelle avec cercle de progression',
              'Changement de couleur selon le temps restant',
              'Arrêt automatique du timer'
            ]
          },
          {
            title: 'Statistiques en temps réel',
            description: 'Suivez les performances pendant le quiz',
            metrics: [
              'Nombre de questions posées',
              'Taux de réussite par élève',
              'Temps moyen de réponse',
              'Questions les plus difficiles'
            ]
          }
        ]
      }
    },
    {
      id: 'statistics-results',
      title: 'Statistiques et résultats',
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      content: {
        overview: 'Analysez les performances de vos élèves et exportez les résultats.',
        features: [
          {
            title: 'Vue d\'ensemble',
            description: 'Consultez les statistiques globales de vos classes',
            metrics: [
              'Nombre total de questions posées',
              'Taux de réussite global',
              'Élève le plus performant',
              'Question la plus difficile'
            ]
          },
          {
            title: 'Résultats par élève',
            description: 'Analysez les performances individuelles',
            data: [
              'Nombre de questions auxquelles l\'élève a répondu',
              'Nombre de bonnes réponses',
              'Pourcentage de réussite',
              'Évolution dans le temps'
            ]
          },
          {
            title: 'Résultats par classe',
            description: 'Comparez les performances entre classes',
            comparisons: [
              'Moyenne de la classe',
              'Écart-type des performances',
              'Distribution des notes',
              'Classement des élèves'
            ]
          },
          {
            title: 'Export des données',
            description: 'Exportez vos résultats pour analyse externe',
            formats: [
              'CSV pour Excel/Google Sheets',
              'PDF pour impression',
              'Copie rapide pour partage'
            ]
          }
        ]
      }
    },
    {
      id: 'subscription-management',
      title: 'Gestion des abonnements',
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      content: {
        overview: 'Gérez votre abonnement et comprenez les limites de votre plan.',
        features: [
          {
            title: 'Plans disponibles',
            description: 'Découvrez les différents plans d\'abonnement',
            plans: [
              {
                name: 'Gratuit',
                price: '0€/mois',
                limits: '1 classe, 30 élèves, 50 questions, 100MB'
              },
              {
                name: 'Basic',
                price: '1,49€/mois',
                limits: '3 classes, 30 élèves, 140 questions, 500MB'
              },
              {
                name: 'Pro',
                price: '4,99€/mois',
                limits: '20 classes, 30 élèves, 1000 questions, 2GB'
              },
              {
                name: 'Premium',
                price: '6,99€/mois',
                limits: '50 classes, 30 élèves, 2000 questions, 5GB'
              },
              {
                name: 'Enterprise',
                price: '12,99€/mois',
                limits: 'Classes illimitées, 35 élèves, questions illimitées, 10GB'
              }
            ]
          },
          {
            title: 'Changement de plan',
            description: 'Upgradez ou downgradez votre plan selon vos besoins',
            process: [
              'Allez dans la section "Abonnement"',
              'Consultez votre plan actuel',
              'Choisissez un nouveau plan',
              'Suivez les instructions de paiement',
              'Votre plan sera mis à jour immédiatement'
            ]
          },
          {
            title: 'Gestion des quotas',
            description: 'Surveillez votre utilisation et vos limites',
            monitoring: [
              'Jauges de progression en temps réel',
              'Alertes quand vous approchez des limites',
              'Calcul automatique du stockage utilisé',
              'Suggestions d\'optimisation'
            ]
          }
        ]
      }
    }
  ]

  const renderSectionContent = (section: any) => {
    switch (section.id) {
      case 'getting-started':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">🎯 Objectif</h3>
              <p className="text-green-700">{section.content.overview}</p>
            </div>
            
            <div className="space-y-4">
              {section.content.steps.map((step: any, index: number) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">{step.title}</h4>
                      </div>
                      <p className="text-gray-600 mb-4 ml-11">{step.description}</p>
                      
                      <button
                        onClick={() => toggleStep(index)}
                        className="ml-11 flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {expandedSteps.has(index) ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                        {expandedSteps.has(index) ? 'Masquer les détails' : 'Voir les détails'}
                      </button>
                      
                      {expandedSteps.has(index) && (
                        <div className="ml-11 mt-4 space-y-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Étapes détaillées :</h5>
                            <ul className="space-y-2">
                              {step.details.map((detail: string, detailIndex: number) => (
                                <li key={detailIndex} className="flex items-start">
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {step.tips && step.tips.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h5 className="font-medium text-blue-900 mb-2 flex items-center">
                                <Info className="w-4 h-4 mr-1" />
                                Conseils :
                              </h5>
                              <ul className="space-y-1">
                                {step.tips.map((tip: string, tipIndex: number) => (
                                  <li key={tipIndex} className="text-blue-700 text-sm">• {tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      
      default:
        return (
          <div className="space-y-6">
            <div className={`${section.bgColor} border border-gray-200 rounded-lg p-6`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 Vue d'ensemble</h3>
              <p className="text-gray-700">{section.content.overview}</p>
            </div>
            
            <div className="space-y-6">
              {section.content.features?.map((feature: any, index: number) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h4>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  
                  {feature.steps && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Étapes :</h5>
                      <ul className="space-y-2">
                        {feature.steps.map((step: string, stepIndex: number) => (
                          <li key={stepIndex} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {feature.methods && (
                    <div className="space-y-4">
                      {feature.methods.map((method: any, methodIndex: number) => (
                        <div key={methodIndex} className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">{method.name} :</h5>
                          <ul className="space-y-1">
                            {method.steps.map((step: string, stepIndex: number) => (
                              <li key={stepIndex} className="flex items-start text-sm">
                                <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                                  {stepIndex + 1}
                                </span>
                                <span className="text-gray-700">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {feature.tips && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <h5 className="font-medium text-blue-900 mb-2 flex items-center">
                        <Info className="w-4 h-4 mr-1" />
                        Conseils :
                      </h5>
                      <ul className="space-y-1">
                        {feature.tips.map((tip: string, tipIndex: number) => (
                          <li key={tipIndex} className="text-blue-700 text-sm">• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
            <p className="text-gray-600 mt-2">Guides détaillés pour maîtriser InstaQuizz</p>
          </div>
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour
        </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Sections</h3>
              <nav className="space-y-2">
                {documentationSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className={`w-4 h-4 mr-2 ${section.color}`} />
                        <span className="text-sm font-medium">{section.title}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        activeSection === section.id ? 'rotate-90' : ''
                      }`} />
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeSection ? (
              renderSectionContent(documentationSections.find(s => s.id === activeSection))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Sélectionnez une section</h2>
                <p className="text-gray-600">Choisissez une section dans le menu de gauche pour commencer à explorer la documentation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
