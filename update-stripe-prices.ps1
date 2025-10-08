# Script PowerShell pour mettre à jour les prix Stripe
# Utilisation: .\update-stripe-prices.ps1

Write-Host "🔄 Mise à jour des prix Stripe..." -ForegroundColor Cyan
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

# IDs des prix existants
$priceIds = @{
    basic = @{
        monthly = "price_1S5sZ7RroRfv8dBg9zAOZwmm"
        annual = "price_1S5sZ8RroRfv8dBgp3w5cQhw"
    }
    pro = @{
        monthly = "price_1S5sZ8RroRfv8dBgjGxiAmwq"
        annual = "price_1S5sZ8RroRfv8dBgyPQWY2xi"
    }
    premium = @{
        monthly = "price_1S5sZ8RroRfv8dBgpOx5phnQ"
        annual = "price_1S5sZ9RroRfv8dBgZ1nDqp8h"
    }
}

foreach ($plan in $prices.Keys) {
    Write-Host "📦 Plan $($plan.ToUpper()):" -ForegroundColor Yellow
    
    # Mettre à jour le prix mensuel
    try {
        $monthlyPrice = $prices[$plan].monthly
        $monthlyId = $priceIds[$plan].monthly
        Write-Host "  💰 Prix mensuel: $monthlyPrice centimes" -ForegroundColor Green
        Write-Host "  🔧 Commande: stripe prices update $monthlyId --unit-amount=$monthlyPrice" -ForegroundColor Gray
        
        $monthlyCommand = "stripe prices update $monthlyId --unit-amount=$monthlyPrice"
        Invoke-Expression $monthlyCommand
        
        Write-Host "  ✅ Prix mensuel mis à jour" -ForegroundColor Green
        Write-Host ""
    }
    catch {
        Write-Host "  ❌ Erreur pour le prix mensuel: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
    
    # Mettre à jour le prix annuel
    try {
        $annualPrice = $prices[$plan].annual
        $annualId = $priceIds[$plan].annual
        Write-Host "  💰 Prix annuel: $annualPrice centimes" -ForegroundColor Green
        Write-Host "  🔧 Commande: stripe prices update $annualId --unit-amount=$annualPrice" -ForegroundColor Gray
        
        $annualCommand = "stripe prices update $annualId --unit-amount=$annualPrice"
        Invoke-Expression $annualCommand
        
        Write-Host "  ✅ Prix annuel mis à jour" -ForegroundColor Green
        Write-Host ""
    }
    catch {
        Write-Host "  ❌ Erreur pour le prix annuel: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "🎉 Mise à jour terminée !" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Résumé des nouveaux prix:" -ForegroundColor Yellow
Write-Host "  BASIC: 0.20€/mois (1.92€/an)" -ForegroundColor White
Write-Host "  PRO: 0.90€/mois (8.64€/an)" -ForegroundColor White
Write-Host "  PREMIUM: 1.99€/mois (19.10€/an)" -ForegroundColor White
Write-Host ""
Write-Host "💡 N'oubliez pas de mettre à jour les priceId dans le code si nécessaire !" -ForegroundColor Yellow



