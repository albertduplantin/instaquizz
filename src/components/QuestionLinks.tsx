import { useState } from 'react'
import { Plus, Trash2, ExternalLink, Link as LinkIcon, Edit2, Check, X } from 'lucide-react'
import type { QuestionLink } from '../types'

interface QuestionLinksProps {
  links: QuestionLink[]
  onLinksChange: (links: QuestionLink[]) => void
  disabled?: boolean
}

export function QuestionLinks({ links, onLinksChange, disabled = false }: QuestionLinksProps) {
  const [editingLink, setEditingLink] = useState<string | null>(null)
  const [newLink, setNewLink] = useState({
    url: '',
    title: '',
    description: ''
  })

  const addLink = () => {
    if (!newLink.url.trim() || !newLink.title.trim()) return

    const link: QuestionLink = {
      id: `link-${Date.now()}`,
      url: newLink.url.startsWith('http') ? newLink.url : `https://${newLink.url}`,
      title: newLink.title,
      description: newLink.description || undefined
    }

    onLinksChange([...links, link])
    setNewLink({ url: '', title: '', description: '' })
  }

  const updateLink = (id: string, updatedLink: Partial<QuestionLink>) => {
    onLinksChange(links.map(link => 
      link.id === id ? { ...link, ...updatedLink } : link
    ))
    setEditingLink(null)
  }

  const deleteLink = (id: string) => {
    onLinksChange(links.filter(link => link.id !== id))
  }

  const startEdit = (link: QuestionLink) => {
    setEditingLink(link.id)
  }

  const cancelEdit = () => {
    setEditingLink(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 flex items-center">
          <LinkIcon className="w-4 h-4 mr-2" />
          Liens web ({links.length})
        </h4>
        {!disabled && (
          <button
            onClick={addLink}
            disabled={!newLink.url.trim() || !newLink.title.trim()}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un lien</span>
          </button>
        )}
      </div>

      {/* Formulaire d'ajout de lien */}
      {!disabled && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                URL du site web *
              </label>
              <input
                type="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://exemple.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Titre du lien *
              </label>
              <input
                type="text"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                placeholder="Nom du site ou ressource"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description (optionnelle)
            </label>
            <input
              type="text"
              value={newLink.description}
              onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
              placeholder="Description courte du contenu"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Liste des liens */}
      <div className="space-y-2">
        {links.map((link) => (
          <div key={link.id} className="bg-white border border-gray-200 rounded-lg p-3">
            {editingLink === link.id ? (
              <EditLinkForm
                link={link}
                onSave={(updatedLink) => updateLink(link.id, updatedLink)}
                onCancel={cancelEdit}
              />
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm break-words"
                    >
                      {link.title}
                    </a>
                  </div>
                  {link.description && (
                    <p className="text-xs text-gray-600 mb-1 break-words">{link.description}</p>
                  )}
                  <p className="text-xs text-gray-500 break-all">{link.url}</p>
                </div>
                {!disabled && (
                  <div className="flex items-center space-x-1 sm:ml-2 self-start sm:self-center">
                    <button
                      onClick={() => startEdit(link)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Modifier le lien"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer le lien"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {links.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <LinkIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Aucun lien ajouté</p>
          <p className="text-xs text-gray-400">
            Ajoutez des liens vers des sites web pour enrichir vos questions
          </p>
        </div>
      )}
    </div>
  )
}

interface EditLinkFormProps {
  link: QuestionLink
  onSave: (link: QuestionLink) => void
  onCancel: () => void
}

function EditLinkForm({ link, onSave, onCancel }: EditLinkFormProps) {
  const [editedLink, setEditedLink] = useState({
    url: link.url,
    title: link.title,
    description: link.description || ''
  })

  const handleSave = () => {
    if (!editedLink.url.trim() || !editedLink.title.trim()) return

    onSave({
      ...link,
      url: editedLink.url.startsWith('http') ? editedLink.url : `https://${editedLink.url}`,
      title: editedLink.title,
      description: editedLink.description || undefined
    })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            URL du site web *
          </label>
          <input
            type="url"
            value={editedLink.url}
            onChange={(e) => setEditedLink({ ...editedLink, url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Titre du lien *
          </label>
          <input
            type="text"
            value={editedLink.title}
            onChange={(e) => setEditedLink({ ...editedLink, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Description (optionnelle)
        </label>
        <input
          type="text"
          value={editedLink.description}
          onChange={(e) => setEditedLink({ ...editedLink, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          onClick={handleSave}
          disabled={!editedLink.url.trim() || !editedLink.title.trim()}
          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
