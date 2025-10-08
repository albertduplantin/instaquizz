# Script PowerShell pour déployer Firebase
Write-Host "🚀 Déploiement Firebase pour InstaQuizz" -ForegroundColor Green

# Vérifier si Firebase CLI est installé
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI détecté: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI non trouvé. Installez-le avec: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}

# Vérifier la connexion Firebase
Write-Host "🔍 Vérification de la connexion Firebase..." -ForegroundColor Yellow
try {
    firebase projects:list | Out-Null
    Write-Host "✅ Connecté à Firebase" -ForegroundColor Green
} catch {
    Write-Host "❌ Non connecté à Firebase. Exécutez: firebase login" -ForegroundColor Red
    exit 1
}

# Déployer les règles Firestore
Write-Host "📝 Déploiement des règles Firestore..." -ForegroundColor Yellow
try {
    firebase deploy --only firestore:rules
    Write-Host "✅ Règles Firestore déployées avec succès !" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du déploiement des règles Firestore" -ForegroundColor Red
    exit 1
}

# Déployer l'application (optionnel)
$deployApp = Read-Host "Voulez-vous aussi déployer l'application ? (y/N)"
if ($deployApp -eq "y" -or $deployApp -eq "Y") {
    Write-Host "🌐 Déploiement de l'application..." -ForegroundColor Yellow
    try {
        firebase deploy --only hosting
        Write-Host "✅ Application déployée avec succès !" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors du déploiement de l'application" -ForegroundColor Red
    }
}

Write-Host "🎉 Déploiement terminé !" -ForegroundColor Green
Write-Host "Console Firebase: https://console.firebase.google.com/project/instaquizz-firebase/overview" -ForegroundColor Cyan


