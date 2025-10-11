# Script PowerShell pour ajouter les variables d'environnement du webhook

Write-Host "🔐 Configuration des variables d'environnement pour le webhook Stripe" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le dossier instaquizz" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Vous allez ajouter 3 variables d'environnement :" -ForegroundColor Yellow
Write-Host "   1. FIREBASE_CLIENT_EMAIL" -ForegroundColor White
Write-Host "   2. FIREBASE_PRIVATE_KEY" -ForegroundColor White
Write-Host "   3. STRIPE_WEBHOOK_SECRET" -ForegroundColor White
Write-Host ""

# Firebase Client Email
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📧 FIREBASE_CLIENT_EMAIL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Où trouver cette valeur :" -ForegroundColor Yellow
Write-Host "  1. Allez sur https://console.firebase.google.com" -ForegroundColor White
Write-Host "  2. Sélectionnez votre projet 'instaquizz-firebase'" -ForegroundColor White
Write-Host "  3. Paramètres du projet > Comptes de service" -ForegroundColor White
Write-Host "  4. Cliquez sur 'Générer une nouvelle clé privée'" -ForegroundColor White
Write-Host "  5. Ouvrez le fichier JSON téléchargé" -ForegroundColor White
Write-Host "  6. Copiez la valeur de 'client_email'" -ForegroundColor White
Write-Host ""
Write-Host "Format attendu : firebase-adminsdk-xxxxx@instaquizz-firebase.iam.gserviceaccount.com" -ForegroundColor Gray
Write-Host ""

$clientEmail = Read-Host "Collez la valeur de FIREBASE_CLIENT_EMAIL"
if ([string]::IsNullOrWhiteSpace($clientEmail)) {
    Write-Host "❌ Valeur vide, abandon" -ForegroundColor Red
    exit 1
}

Write-Host "✅ FIREBASE_CLIENT_EMAIL configuré" -ForegroundColor Green
Write-Host ""

# Firebase Private Key
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🔑 FIREBASE_PRIVATE_KEY" -ForegroundColor Cyan
Write-Host ""
Write-Host "Où trouver cette valeur :" -ForegroundColor Yellow
Write-Host "  - Dans le MÊME fichier JSON que client_email" -ForegroundColor White
Write-Host "  - Cherchez la clé 'private_key'" -ForegroundColor White
Write-Host "  - Copiez la valeur COMPLÈTE (y compris les guillemets et \n)" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT : La clé doit commencer par:" -ForegroundColor Yellow
Write-Host '  "-----BEGIN PRIVATE KEY-----\n' -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Astuce : Vous pouvez copier-coller depuis le JSON directement" -ForegroundColor Cyan
Write-Host ""

$privateKey = Read-Host "Collez la valeur de FIREBASE_PRIVATE_KEY (avec les guillemets)"
if ([string]::IsNullOrWhiteSpace($privateKey)) {
    Write-Host "❌ Valeur vide, abandon" -ForegroundColor Red
    exit 1
}

# Vérifier que la clé commence par les guillemets et BEGIN PRIVATE KEY
if (-not $privateKey.StartsWith('"-----BEGIN PRIVATE KEY-----')) {
    Write-Host "⚠️  Attention : la clé ne semble pas avoir le bon format" -ForegroundColor Yellow
    Write-Host "Elle devrait commencer par:" -ForegroundColor Yellow
    Write-Host '"-----BEGIN PRIVATE KEY-----\n' -ForegroundColor Gray
    $continue = Read-Host "Voulez-vous continuer quand même ? (O/N)"
    if ($continue -ne 'O' -and $continue -ne 'o') {
        Write-Host "Abandon" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ FIREBASE_PRIVATE_KEY configuré" -ForegroundColor Green
Write-Host ""

# Stripe Webhook Secret
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🔗 STRIPE_WEBHOOK_SECRET" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Cette variable nécessite que l'API soit déjà déployée" -ForegroundColor Yellow
Write-Host ""
Write-Host "Où trouver cette valeur :" -ForegroundColor Yellow
Write-Host "  1. Allez sur https://dashboard.stripe.com/test/webhooks" -ForegroundColor White
Write-Host "  2. Cliquez sur 'Ajouter un endpoint'" -ForegroundColor White
Write-Host "  3. URL : https://instaquizz.vercel.app/api/webhook" -ForegroundColor White
Write-Host "  4. Sélectionnez les événements :" -ForegroundColor White
Write-Host "     - checkout.session.completed" -ForegroundColor Gray
Write-Host "     - customer.subscription.updated" -ForegroundColor Gray
Write-Host "     - customer.subscription.deleted" -ForegroundColor Gray
Write-Host "     - invoice.payment_succeeded" -ForegroundColor Gray
Write-Host "     - invoice.payment_failed" -ForegroundColor Gray
Write-Host "  5. Copiez le 'Signing secret' (commence par whsec_)" -ForegroundColor White
Write-Host ""
Write-Host "Si vous n'avez pas encore créé le webhook, vous pouvez :" -ForegroundColor Cyan
Write-Host "  A) Laisser vide maintenant et l'ajouter plus tard" -ForegroundColor White
Write-Host "  B) Le créer maintenant et revenir ici" -ForegroundColor White
Write-Host ""

$webhookSecret = Read-Host "Collez la valeur de STRIPE_WEBHOOK_SECRET (ou laissez vide)"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Résumé
Write-Host "📋 Résumé des variables à ajouter :" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ FIREBASE_CLIENT_EMAIL : $($clientEmail.Substring(0, [Math]::Min(40, $clientEmail.Length)))..." -ForegroundColor Green
Write-Host "✅ FIREBASE_PRIVATE_KEY : [configuré]" -ForegroundColor Green
if ([string]::IsNullOrWhiteSpace($webhookSecret)) {
    Write-Host "⚠️  STRIPE_WEBHOOK_SECRET : [à ajouter plus tard]" -ForegroundColor Yellow
} else {
    Write-Host "✅ STRIPE_WEBHOOK_SECRET : $($webhookSecret.Substring(0, [Math]::Min(20, $webhookSecret.Length)))..." -ForegroundColor Green
}
Write-Host ""

$confirm = Read-Host "Voulez-vous ajouter ces variables maintenant ? (O/N)"
if ($confirm -ne 'O' -and $confirm -ne 'o') {
    Write-Host ""
    Write-Host "❌ Annulé. Vous pouvez relancer ce script plus tard." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Pour ajouter manuellement :" -ForegroundColor Cyan
    Write-Host "   vercel env add FIREBASE_CLIENT_EMAIL production" -ForegroundColor White
    Write-Host "   vercel env add FIREBASE_PRIVATE_KEY production" -ForegroundColor White
    Write-Host "   vercel env add STRIPE_WEBHOOK_SECRET production" -ForegroundColor White
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "🚀 Ajout des variables dans Vercel..." -ForegroundColor Yellow
Write-Host ""

# Ajouter FIREBASE_CLIENT_EMAIL
Write-Host "Ajout de FIREBASE_CLIENT_EMAIL..." -ForegroundColor White
$clientEmail | vercel env add FIREBASE_CLIENT_EMAIL production
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'ajout de FIREBASE_CLIENT_EMAIL" -ForegroundColor Red
} else {
    Write-Host "✅ FIREBASE_CLIENT_EMAIL ajouté" -ForegroundColor Green
}

# Ajouter FIREBASE_PRIVATE_KEY
Write-Host "Ajout de FIREBASE_PRIVATE_KEY..." -ForegroundColor White
$privateKey | vercel env add FIREBASE_PRIVATE_KEY production
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'ajout de FIREBASE_PRIVATE_KEY" -ForegroundColor Red
} else {
    Write-Host "✅ FIREBASE_PRIVATE_KEY ajouté" -ForegroundColor Green
}

# Ajouter STRIPE_WEBHOOK_SECRET si fourni
if (-not [string]::IsNullOrWhiteSpace($webhookSecret)) {
    Write-Host "Ajout de STRIPE_WEBHOOK_SECRET..." -ForegroundColor White
    $webhookSecret | vercel env add STRIPE_WEBHOOK_SECRET production
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'ajout de STRIPE_WEBHOOK_SECRET" -ForegroundColor Red
    } else {
        Write-Host "✅ STRIPE_WEBHOOK_SECRET ajouté" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "  1. Redéployez l'application : vercel --prod" -ForegroundColor White
if ([string]::IsNullOrWhiteSpace($webhookSecret)) {
    Write-Host "  2. Créez le webhook sur Stripe Dashboard" -ForegroundColor White
    Write-Host "  3. Ajoutez STRIPE_WEBHOOK_SECRET avec : vercel env add STRIPE_WEBHOOK_SECRET production" -ForegroundColor White
    Write-Host "  4. Re-redéployez : vercel --prod" -ForegroundColor White
}
Write-Host ""
Write-Host "🧪 Pour tester :" -ForegroundColor Cyan
Write-Host "  - Allez sur https://instaquizz.vercel.app/#/subscription" -ForegroundColor White
Write-Host "  - Effectuez un paiement de test" -ForegroundColor White
Write-Host "  - Vérifiez que votre abonnement est mis à jour" -ForegroundColor White
Write-Host ""

