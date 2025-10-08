import React from 'react'
import { ExternalLink } from 'lucide-react'

interface FormattedTextProps {
  text: string
  className?: string
}

export function FormattedText({ text, className = '' }: FormattedTextProps) {
  // Fonction pour parser le markdown simple et les liens
  const parseFormattedText = (text: string) => {
    const elements: React.ReactNode[] = []
    let lastIndex = 0

    // Regex pour les liens markdown [texte](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    // Regex pour le gras **texte**
    const boldRegex = /\*\*([^*]+)\*\*/g
    // Regex pour l'italique *texte*
    const italicRegex = /\*([^*]+)\*/g
    // Regex pour les URLs brutes
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi

    // Combiner toutes les regex
    const allRegexes = [
      { regex: linkRegex, type: 'link' },
      { regex: boldRegex, type: 'bold' },
      { regex: italicRegex, type: 'italic' },
      { regex: urlRegex, type: 'url' }
    ]

    // Trouver tous les matches
    const matches: Array<{
      type: string
      match: RegExpExecArray
      start: number
      end: number
    }> = []

    allRegexes.forEach(({ regex, type }) => {
      let match
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          type,
          match,
          start: match.index,
          end: match.index + match[0].length
        })
      }
    })

    // Trier par position de début
    matches.sort((a, b) => a.start - b.start)

    // Supprimer les chevauchements (priorité aux liens)
    const filteredMatches = []
    let lastEnd = 0

    for (const match of matches) {
      if (match.start >= lastEnd) {
        filteredMatches.push(match)
        lastEnd = match.end
      }
    }

    // Construire les éléments
    filteredMatches.forEach((match, index) => {
      const { type, match: regexMatch, start, end } = match

      // Ajouter le texte avant le match
      if (start > lastIndex) {
        elements.push(text.substring(lastIndex, start))
      }

      // Ajouter l'élément formaté
      if (type === 'link') {
        const linkText = regexMatch[1]
        const linkUrl = regexMatch[2]
        const cleanUrl = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
        
        elements.push(
          <a
            key={`link-${index}`}
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 hover:decoration-blue-800 transition-colors inline-flex items-center gap-1"
            title={`Ouvrir ${cleanUrl}`}
          >
            {linkText}
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        )
      } else if (type === 'bold') {
        elements.push(
          <strong key={`bold-${index}`} className="font-semibold">
            {regexMatch[1]}
          </strong>
        )
      } else if (type === 'italic') {
        elements.push(
          <em key={`italic-${index}`} className="italic">
            {regexMatch[1]}
          </em>
        )
      } else if (type === 'url') {
        const url = regexMatch[0]
        const cleanUrl = url.startsWith('http') ? url : `https://${url}`
        
        elements.push(
          <a
            key={`url-${index}`}
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 hover:decoration-blue-800 transition-colors inline-flex items-center gap-1"
            title={`Ouvrir ${cleanUrl}`}
          >
            {url}
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        )
      }

      lastIndex = end
    })

    // Ajouter le texte restant
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex))
    }

    return elements
  }

  return (
    <span className={className}>
      {parseFormattedText(text)}
    </span>
  )
}



