
interface TextWithLinksProps {
  text: string
  className?: string
}

export function TextWithLinks({ text, className = '' }: TextWithLinksProps) {
  // Fonction pour détecter et transformer les liens en éléments cliquables
  const parseTextWithLinks = (text: string) => {
    // Regex pour détecter les URLs (http, https, www, et domaines simples)
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi
    
    const parts = text.split(urlRegex)
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        // Nettoyer l'URL et s'assurer qu'elle a un protocole
        let cleanUrl = part.trim()
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = `https://${cleanUrl}`
        }
        
        return (
          <a
            key={index}
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 hover:decoration-blue-800 transition-colors"
            title={`Ouvrir ${cleanUrl}`}
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  return (
    <span className={className}>
      {parseTextWithLinks(text)}
    </span>
  )
}
