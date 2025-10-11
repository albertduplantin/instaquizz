# Script PowerShell pour déployer InstaQuizz avec l'API Stripe

Write-Host "🚀 Déploiement InstaQuizz avec API Stripe" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le dossier instaquizz" -ForegroundColor Red
    exit 1
}

# Vérifier que les dépendances de l'API sont installées
Write-Host "📦 Vérification des dépendances de l'API..." -ForegroundColor Yellow
if (-not (Test-Path "api/node_modules")) {
    Write-Host "⚙️  Installation des dépendances de l'API..." -ForegroundColor Yellow
    Set-Location api
    npm install
    Set-Location ..
    Write-Host "✅ Dépendances de l'API installées" -ForegroundColor Green
} else {
    Write-Host "✅ Dépendances de l'API déjà installées" -ForegroundColor Green
}

# Vérifier que les variables d'environnement critiques sont configurées
Write-Host ""
Write-Host "🔍 Vérification des variables d'environnement..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Assurez-vous d'avoir configuré ces variables dans Vercel:" -ForegroundColor Yellow
Write-Host "   - STRIPE_SECRET_KEY" -ForegroundColor White
Write-Host "   - VITE_APP_URL" -ForegroundColor White
Write-Host ""
Write-Host "📝 Variables optionnelles (pour le webhook):" -ForegroundColor Yellow
Write-Host "   - FIREBASE_CLIENT_EMAIL" -ForegroundColor White
Write-Host "   - FIREBASE_PRIVATE_KEY" -ForegroundColor White
Write-Host "   - STRIPE_WEBHOOK_SECRET" -ForegroundColor White
Write-Host ""

# Demander confirmation
$confirmation = Read-Host "Les variables sont-elles configurées dans Vercel? (O/N)"
if ($confirmation -ne 'O' -and $confirmation -ne 'o') {
    Write-Host ""
    Write-Host "📚 Pour configurer les variables:" -ForegroundColor Cyan
    Write-Host "   1. Allez sur https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "   2. Sélectionnez votre projet" -ForegroundColor White
    Write-Host "   3. Settings > Environment Variables" -ForegroundColor White
    Write-Host "   4. Ajoutez les variables nécessaires" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Consultez DEPLOIEMENT_RAPIDE.md pour plus de détails" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

# Build de l'application
Write-Host ""
Write-Host "🏗️  Build de l'application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build réussi" -ForegroundColor Green

# Déploiement sur Vercel
Write-Host ""
Write-Host "🚀 Déploiement sur Vercel..." -ForegroundColor Yellow
vercel --prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Déploiement réussi!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 InstaQuizz avec API Stripe est déployé!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Testez un paiement sur https://instaquizz.vercel.app/#/subscription" -ForegroundColor White
Write-Host "   2. Utilisez la carte de test: 4242 4242 4242 4242" -ForegroundColor White
Write-Host "   3. Configurez le webhook Stripe (voir DEPLOIEMENT_RAPIDE.md)" -ForegroundColor White
Write-Host ""

