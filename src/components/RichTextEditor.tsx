import { useState, useRef } from 'react'
import { Link, Unlink, Bold, Italic } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = '', 
  className = '',
  rows = 4 
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fonction pour insérer un lien dans le texte
  const insertLink = () => {
    if (!linkUrl.trim() || !linkText.trim()) return

    const textarea = textareaRef.current
    if (!textarea) return

    const start = selection?.start || textarea.selectionStart
    const end = selection?.end || textarea.selectionEnd
    const before = value.substring(0, start)
    const after = value.substring(end)
    
    // Nettoyer l'URL
    let cleanUrl = linkUrl.trim()
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`
    }

    const linkMarkdown = `[${linkText}](${cleanUrl})`
    const newValue = before + linkMarkdown + after
    
    onChange(newValue)
    
    // Fermer le dialog et réinitialiser
    setShowLinkDialog(false)
    setLinkUrl('')
    setLinkText('')
    setSelection(null)
    
    // Remettre le focus sur le textarea
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + linkMarkdown.length, start + linkMarkdown.length)
    }, 0)
  }

  // Fonction pour supprimer un lien
  const removeLink = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    // Vérifier si le texte sélectionné contient un lien markdown
    const linkRegex = /\[([^\]]+)\]\([^)]+\)/
    if (linkRegex.test(selectedText)) {
      const newText = selectedText.replace(linkRegex, '$1')
      const before = value.substring(0, start)
      const after = value.substring(end)
      onChange(before + newText + after)
    }
  }

  // Fonction pour appliquer le formatage (gras/italique)
  const applyFormatting = (format: 'bold' | 'italic') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    if (!selectedText) return

    const before = value.substring(0, start)
    const after = value.substring(end)
    
    let formattedText = ''
    if (format === 'bold') {
      formattedText = `**${selectedText}**`
    } else if (format === 'italic') {
      formattedText = `*${selectedText}*`
    }
    
    const newValue = before + formattedText + after
    onChange(newValue)
    
    // Remettre le focus et sélectionner le texte formaté
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start, start + formattedText.length)
    }, 0)
  }

  // Gérer la sélection de texte
  const handleSelectionChange = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    setSelection({
      start: textarea.selectionStart,
      end: textarea.selectionEnd
    })
  }

  // Vérifier si le texte sélectionné contient un lien
  const hasSelectedLink = () => {
    if (!selection) return false
    const selectedText = value.substring(selection.start, selection.end)
    const linkRegex = /\[([^\]]+)\]\([^)]+\)/
    return linkRegex.test(selectedText)
  }

  return (
    <div className="space-y-2">
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 p-2 bg-gray-50 border border-gray-200 rounded-t-lg">
        <button
          type="button"
          onClick={() => setShowLinkDialog(true)}
          className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Insérer un lien"
        >
          <Link className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={removeLink}
          disabled={!hasSelectedLink()}
          className="p-1.5 sm:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Supprimer le lien"
        >
          <Unlink className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 hidden sm:block" />
        
        <button
          type="button"
          onClick={() => applyFormatting('bold')}
          className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Gras"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => applyFormatting('italic')}
          className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Italique"
        >
          <Italic className="w-4 h-4" />
        </button>
      </div>

      {/* Zone de texte */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelectionChange}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${className}`}
      />

      {/* Dialog d'insertion de lien */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Insérer un lien</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texte du lien *
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Texte à afficher"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://exemple.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowLinkDialog(false)
                  setLinkUrl('')
                  setLinkText('')
                }}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors order-2 sm:order-1"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={insertLink}
                disabled={!linkUrl.trim() || !linkText.trim()}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors order-1 sm:order-2"
              >
                Insérer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aide */}
      <div className="text-xs text-gray-500">
        <p>💡 <strong>Astuce :</strong> Sélectionnez du texte et cliquez sur l'icône lien pour créer un hyperlien</p>
        <p>📝 <strong>Formatage :</strong> Utilisez **gras** et *italique* ou les boutons de la barre d'outils</p>
      </div>
    </div>
  )
}
