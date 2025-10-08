import React from 'react'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
}

export const SEO: React.FC<SEOProps> = ({
  title: _title = "InstaQuizz - Plateforme de Quiz Interactifs pour Enseignants",
  description = "Créez des quiz instantanés, gérez vos classes, tirez au sort vos élèves. L'outil pédagogique moderne pour rendre vos cours plus interactifs et engageants.",
  image = "https://instaquizz.vercel.app/og-image.png",
  url = "https://instaquizz.vercel.app/",
  type: _type = "website"
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "InstaQuizz",
    "description": description,
    "url": url,
    "image": image,
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "description": "Plan gratuit disponible"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Organization",
      "name": "InstaQuizz",
      "url": "https://instaquizz.vercel.app/"
    },
    "publisher": {
      "@type": "Organization",
      "name": "InstaQuizz",
      "url": "https://instaquizz.vercel.app/"
    },
    "keywords": [
      "quiz éducatif",
      "professeur",
      "enseignant",
      "école",
      "collège",
      "lycée",
      "pédagogie",
      "éducation",
      "outil enseignant",
      "quiz interactif",
      "évaluation",
      "test",
      "examen",
      "révision"
    ],
    "featureList": [
      "Création de quiz instantanés",
      "Gestion des classes",
      "Tirage au sort des élèves",
      "Statistiques détaillées",
      "Banque de questions",
      "Interface intuitive",
      "Gratuit et sans publicité"
    ],
    "screenshot": "https://instaquizz.vercel.app/og-image.png",
    "softwareVersion": "1.0.0",
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "inLanguage": "fr-FR",
    "isAccessibleForFree": true,
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareHelp": "https://instaquizz.vercel.app/support"
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  )
}

export default SEO
