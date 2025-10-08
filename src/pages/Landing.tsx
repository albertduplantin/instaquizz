import { BookOpen, Users, BarChart3, Zap, Star, CheckCircle } from 'lucide-react'

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            🎯 <span className="text-blue-600">InstaQuizz</span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-8">
            Plateforme de Quiz Interactifs pour Enseignants
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Créez des quiz instantanés, gérez vos classes, tirez au sort vos élèves. 
            L'outil pédagogique moderne qui rend vos cours plus interactifs et engageants. 
            <strong> Gratuit et sans publicité</strong>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Commencer Gratuitement
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
              Voir la Démo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Pourquoi Choisir InstaQuizz ?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quiz Instantanés</h3>
              <p className="text-gray-600">
                Créez et lancez des quiz en quelques secondes. Interface intuitive et rapide.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gestion des Classes</h3>
              <p className="text-gray-600">
                Organisez vos élèves par classe. Importez facilement vos listes d'élèves.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Banque de Questions</h3>
              <p className="text-gray-600">
                Stockez et réutilisez vos questions. Import/export en masse.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Statistiques Détaillées</h3>
              <p className="text-gray-600">
                Suivez les progrès de vos élèves. Rapports et analyses complètes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Parfait pour Tous les Niveaux
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-blue-600">🏫 École Primaire</h3>
              <ul className="space-y-3">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Quiz colorés et ludiques</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Interface simple pour les enfants</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Images et médias intégrés</li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-green-600">🎓 Collège & Lycée</h3>
              <ul className="space-y-3">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Questions complexes et variées</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Statistiques avancées</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Gestion de plusieurs matières</li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-purple-600">🎓 Formation & Université</h3>
              <ul className="space-y-3">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Quiz professionnels</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Export des résultats</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Intégration LMS</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Ce Que Disent Nos Utilisateurs
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "InstaQuizz a révolutionné mes cours ! Mes élèves sont beaucoup plus engagés et participent davantage."
              </p>
              <p className="font-semibold">- Marie L., Professeure de Mathématiques</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Interface intuitive et fonctionnalités complètes. Parfait pour mes classes de collège."
              </p>
              <p className="font-semibold">- Pierre M., Professeur d'Histoire</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Gratuit et sans publicité, exactement ce qu'il me fallait pour mes formations."
              </p>
              <p className="font-semibold">- Sophie D., Formatrice</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à Révolutionner Vos Cours ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des milliers d'enseignants qui utilisent InstaQuizz pour rendre leurs cours plus interactifs.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
            Commencer Maintenant - C'est Gratuit !
          </button>
        </div>
      </section>
    </div>
  )
}
