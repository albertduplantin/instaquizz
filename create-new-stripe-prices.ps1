# Script PowerShell pour créer de nouveaux prix Stripe
# Utilisation: .\create-new-stripe-prices.ps1

Write-Host "🔄 Création de nouveaux prix Stripe..." -ForegroundColor Cyan
Write-Host ""

# Nouveaux prix (en centimes pour Stripe)
$prices = @{
    basic = @{
        monthly = 20    # 0.20€ = 20 centimes
        annual = 192    # 1.92€ = 192 centimes
    }
    pro = @{
        monthly = 90    # 0.90€ = 90 centimes
        annual = 864    # 8.64€ = 864 centimes
    }
    premium = @{
        monthly = 199   # 1.99€ = 199 centimes
        annual = 1910   # 19.10€ = 1910 centimes
    }
}

# Créer les nouveaux prix
foreach ($plan in $prices.Keys) {
    Write-Host "📦 Plan $($plan.ToUpper()):" -ForegroundColor Yellow
    
    # Créer le prix mensuel
    try {
        $monthlyPrice = $prices[$plan].monthly
        Write-Host "  💰 Création prix mensuel: $monthlyPrice centimes" -ForegroundColor Green
        
        $monthlyCommand = "stripe prices create --unit-amount=$monthlyPrice --currency=eur --recurring[interval]=month --product=prod_instaquizz_$plan"
        Write-Host "  🔧 Commande: $monthlyCommand" -ForegroundColor Gray
        
        $monthlyResult = Invoke-Expression $monthlyCommand
        Write-Host "  ✅ Prix mensuel créé: $($monthlyResult | ConvertFrom-Json | Select-Object -ExpandProperty id)" -ForegroundColor Green
        Write-Host ""
    }
    catch {
        Write-Host "  ❌ Erreur pour le prix mensuel: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
    
    # Créer le prix annuel
    try {
        $annualPrice = $prices[$plan].annual
        Write-Host "  💰 Création prix annuel: $annualPrice centimes" -ForegroundColor Green
        
        $annualCommand = "stripe prices create --unit-amount=$annualPrice --currency=eur --recurring[interval]=year --product=prod_instaquizz_$plan"
        Write-Host "  🔧 Commande: $annualCommand" -ForegroundColor Gray
        
        $annualResult = Invoke-Expression $annualCommand
        Write-Host "  ✅ Prix annuel créé: $($annualResult | ConvertFrom-Json | Select-Object -ExpandProperty id)" -ForegroundColor Green
        Write-Host ""
    }
    catch {
        Write-Host "  ❌ Erreur pour le prix annuel: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "🎉 Création terminée !" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Nouveaux prix créés:" -ForegroundColor Yellow
Write-Host "  BASIC: 0.20€/mois (1.92€/an)" -ForegroundColor White
Write-Host "  PRO: 0.90€/mois (8.64€/an)" -ForegroundColor White
Write-Host "  PREMIUM: 1.99€/mois (19.10€/an)" -ForegroundColor White
Write-Host ""
Write-Host "💡 N'oubliez pas de mettre à jour les priceId dans le code !" -ForegroundColor Yellow



