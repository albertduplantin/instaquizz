import { useState, useEffect } from 'react'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  UserCheck, 
  Crown, 
  Plus,
  Trash2,
  Edit,
  X,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react'
import { adminService } from '../lib/adminService'
import { subscriptionService } from '../lib/subscriptionService'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { useToastContext } from '../contexts/ToastContext'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Tooltip } from '../components/Tooltip'
import type { AdminStats, UserWithSubscription, SubscriptionPlan } from '../types'

export function AdminDashboard() {
  const { user } = useFirebaseAuth()
  const { showSuccess, showError, showInfo } = useToastContext()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<UserWithSubscription[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [showGiveSubscription, setShowGiveSubscription] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithSubscription | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('basic')
  const [duration, setDuration] = useState(12)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlan, setFilterPlan] = useState<SubscriptionPlan | 'all'>('all')
  
  // États pour les confirmations
  const [confirmCancel, setConfirmCancel] = useState<{ show: boolean; userId: string | null }>({ show: false, userId: null })
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; userId: string | null }>({ show: false, userId: null })

  useEffect(() => {
    if (user && adminService.isAdmin(user.email || '')) {
      loadData()
    }
  }, [user])

  // Filtrage des utilisateurs
  useEffect(() => {
    let filtered = users

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par plan
    if (filterPlan !== 'all') {
      filtered = filtered.filter(user => user.subscription?.plan === filterPlan)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, filterPlan])

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsData, usersData] = await Promise.all([
        adminService.getStats(),
        adminService.getAllUsers()
      ])
      setStats(statsData)
      setUsers(usersData)
      showInfo('Données chargées', `${usersData.length} utilisateur(s) trouvé(s)`)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      showError('Erreur de chargement', 'Impossible de charger les données admin')
    } finally {
      setLoading(false)
    }
  }

  const handleGiveSubscription = async () => {
    if (!selectedUser) return

    try {
      const result = await adminService.giveSubscription(selectedUser.id, selectedPlan, duration)
      if (result.success) {
        showSuccess('Abonnement attribué', result.message)
        setShowGiveSubscription(false)
        setSelectedUser(null)
        await loadData() // Recharger les données
      } else {
        showError('Erreur', result.message)
      }
    } catch (error) {
      showError('Erreur', 'Impossible d\'attribuer l\'abonnement')
    }
  }

  const handleCancelSubscription = (userId: string) => {
    setConfirmCancel({ show: true, userId })
  }

  const confirmCancelSubscription = async () => {
    if (!confirmCancel.userId) return

    try {
      const result = await adminService.cancelSubscription(confirmCancel.userId)
      if (result.success) {
        showSuccess('Abonnement annulé', result.message)
        await loadData()
      } else {
        showError('Erreur', result.message)
      }
    } catch (error) {
      showError('Erreur', 'Impossible d\'annuler l\'abonnement')
    } finally {
      setConfirmCancel({ show: false, userId: null })
    }
  }

  const handleDeleteUser = (userId: string) => {
    setConfirmDelete({ show: true, userId })
  }

  const confirmDeleteUser = async () => {
    if (!confirmDelete.userId) return

    try {
      const result = await adminService.deleteUser(confirmDelete.userId)
      if (result.success) {
        showSuccess('Utilisateur supprimé', result.message)
        await loadData()
      } else {
        showError('Erreur', result.message)
      }
    } catch (error) {
      showError('Erreur', 'Impossible de supprimer l\'utilisateur')
    } finally {
      setConfirmDelete({ show: false, userId: null })
    }
  }

  if (!user || !adminService.isAdmin(user.email || '')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les droits d'administrateur</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const plans = subscriptionService.getAllPlans()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Tableau de bord Admin
              </h1>
              <p className="text-gray-600">
                Gestion des utilisateurs et des abonnements
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Administrateur</span>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilisateurs totaux</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenus mensuels</p>
                  <p className="text-2xl font-bold text-gray-900">€{stats.monthlyRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <UserCheck className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Abonnements actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilisateurs payants</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.paidUsers}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Utilisateurs ({filteredUsers.length})</h2>
              <div className="flex items-center space-x-2">
                <Tooltip content="Actualiser les données">
                  <button
                    onClick={loadData}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Attribuer un abonnement à un utilisateur">
                  <button
                    onClick={() => setShowGiveSubscription(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Donner un abonnement
                  </button>
                </Tooltip>
              </div>
            </div>
            
            {/* Contrôles de recherche et filtrage */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value as SubscriptionPlan | 'all')}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les plans</option>
                  <option value="free">Gratuit</option>
                  <option value="basic">Basique</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Entreprise</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abonnement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statistiques
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || filterPlan !== 'all' 
                        ? 'Aucun utilisateur ne correspond aux critères de recherche'
                        : 'Aucun utilisateur trouvé'
                      }
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.displayName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.subscription ? (
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.subscription.plan === 'free' 
                              ? 'bg-gray-100 text-gray-800'
                              : user.subscription.plan === 'basic'
                              ? 'bg-blue-100 text-blue-800'
                              : user.subscription.plan === 'premium'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.subscription.plan}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {user.subscription.status}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Aucun abonnement</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div>{user.totalClasses} classes</div>
                        <div>{user.totalStudents} étudiants</div>
                        <div>{user.totalQuestions} questions</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Tooltip content="Modifier l'abonnement">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowGiveSubscription(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      {user.subscription && user.subscription.plan !== 'free' && (
                        <Tooltip content="Annuler l'abonnement">
                          <button
                            onClick={() => handleCancelSubscription(user.id)}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      )}
                      <Tooltip content="Supprimer l'utilisateur">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal pour donner un abonnement */}
        {showGiveSubscription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Donner un abonnement</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utilisateur
                  </label>
                  <select
                    value={selectedUser?.id || ''}
                    onChange={(e) => {
                      const user = users.find(u => u.id === e.target.value)
                      setSelectedUser(user || null)
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Sélectionner un utilisateur</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.displayName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan
                  </label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value as SubscriptionPlan)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - €{plan.price}/mois
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (mois)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    min="1"
                    max="60"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowGiveSubscription(false)
                    setSelectedUser(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleGiveSubscription}
                  disabled={!selectedUser}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Donner l'abonnement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmations */}
        <ConfirmDialog
          isOpen={confirmCancel.show}
          onClose={() => setConfirmCancel({ show: false, userId: null })}
          onConfirm={confirmCancelSubscription}
          title="Annuler l'abonnement"
          message="Êtes-vous sûr de vouloir annuler cet abonnement ? L'utilisateur perdra l'accès aux fonctionnalités payantes."
          confirmText="Annuler l'abonnement"
          cancelText="Garder l'abonnement"
          type="warning"
        />

        <ConfirmDialog
          isOpen={confirmDelete.show}
          onClose={() => setConfirmDelete({ show: false, userId: null })}
          onConfirm={confirmDeleteUser}
          title="Supprimer l'utilisateur"
          message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action supprimera définitivement toutes ses données (classes, étudiants, questions, abonnements)."
          confirmText="Supprimer définitivement"
          cancelText="Annuler"
          type="danger"
        />
      </div>
    </div>
  )
}
