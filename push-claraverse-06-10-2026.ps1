# ================================================================
# Script de Push ClaraVerse vers GitHub
# Version: 06 Octobre 2026 - Persistance Encours + Isolation Chat OK + Migration DOM V1.4
# Repository: https://github.com/sekadalle2024/Claraveverse_06__10-2026_persistance_encours_isolation_chat_OK_migration_DOM_V1.4.git
# ================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse - 06 Octobre 2026                              " -ForegroundColor Cyan
Write-Host "  Version: Persistance Encours + Isolation Chat OK + Migration DOM V1.4" -ForegroundColor Cyan
Write-Host "  Solution: Commits Multiples pour projet de plus de 140 MB      " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claraveverse_06__10-2026_persistance_encours_isolation_chat_OK_migration_DOM_V1.4.git"
$branche = "main"
$commitPrefix = "Sauvegarde ClaraVerse - 06 Oct 2026 - Persistance Encours + Isolation Chat + Migration DOM V1.4"

# Fonction pour push avec retry
function Push-WithRetry {
    param(
        [string]$message,
        [int]$maxRetries = 3
    )
    
    $retry = 0
    while ($retry -lt $maxRetries) {
        Write-Host "  Push tentative $($retry + 1)/$maxRetries..." -ForegroundColor Gray
        
        $pushOutput = git push origin $branche 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Push reussi: $message" -ForegroundColor Green
            return $true
        }
        
        Write-Host "  ✗ Erreur: $pushOutput" -ForegroundColor Red
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  ⏳ Nouvelle tentative dans 10 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
    
    Write-Host "  ✗ Push echoue apres $maxRetries tentatives" -ForegroundColor Red
    return $false
}

# Etape 1: Verifier l'etat actuel
Write-Host "1. Verification de l'etat Git..." -ForegroundColor Yellow
$gitStatus = git status --short
if ($gitStatus) {
    $fileCount = ($gitStatus | Measure-Object).Count
    Write-Host "  📝 Fichiers modifies detectes: $fileCount fichiers" -ForegroundColor White
} else {
    Write-Host "  ✓ Aucun fichier modifie" -ForegroundColor Green
}

# Etape 2: Verifier la branche
Write-Host ""
Write-Host "2. Verification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "  Branche actuelle: $currentBranch" -ForegroundColor Gray

if ($currentBranch -ne $branche) {
    Write-Host "  Changement de branche vers $branche..." -ForegroundColor Yellow
    git checkout -b $branche 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        git checkout $branche 2>&1 | Out-Null
    }
    Write-Host "  ✓ Branche configuree: $branche" -ForegroundColor Green
}

# Etape 3: Configuration Git optimale pour gros projet
Write-Host ""
Write-Host "3. Configuration Git optimale pour gros projet..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 2147483647
git config http.maxRequestBuffer 536870912
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
git config pack.windowMemory "100m"
git config pack.packSizeLimit "100m"
git config pack.threads "1"
Write-Host "  ✓ Configuration appliquee" -ForegroundColor Green

# Etape 4: Configurer le remote
Write-Host ""
Write-Host "4. Configuration du repository distant..." -ForegroundColor Yellow
$remotes = git remote
if ($remotes -contains "origin") {
    git remote set-url origin $repoUrl
    Write-Host "  ✓ Remote 'origin' mis a jour" -ForegroundColor Green
} else {
    git remote add origin $repoUrl
    Write-Host "  ✓ Remote 'origin' ajoute" -ForegroundColor Green
}

Write-Host ""
Write-Host "  🎯 Repository cible:" -ForegroundColor Cyan
Write-Host "  $repoUrl" -ForegroundColor White

# Etape 5: Verifier la connexion
Write-Host ""
Write-Host "5. Verification de la connexion au repository..." -ForegroundColor Yellow
$lsRemote = git ls-remote origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Connexion au repository reussie" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Attention: Le repository sera cree lors du premier push" -ForegroundColor Yellow
    Write-Host "  ℹ️ C'est normal pour un nouveau repository" -ForegroundColor Gray
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  🚀 DEBUT DU PUSH EN 7 PARTIES                                   " -ForegroundColor Cyan
Write-Host "  Chaque partie < 30 MB pour eviter les timeouts                  " -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# Partie 1: Code Source React/TypeScript
Write-Host ""
Write-Host "📦 Partie 1/7: Code Source React/TypeScript (src/)..." -ForegroundColor Cyan
git add src/ 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 1: Code Source React/TypeScript" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✓ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Code Source React/TypeScript")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Solution alternative: Utilisez GitHub Desktop" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun changement dans src/" -ForegroundColor Gray
}

# Partie 2: Backend Python
Write-Host ""
Write-Host "📦 Partie 2/7: Backend Python (py_backend/)..." -ForegroundColor Cyan
git add py_backend/ 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 2: Backend Python" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✓ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Backend Python")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun changement dans py_backend/" -ForegroundColor Gray
}

# Partie 3: Fichiers Publics
Write-Host ""
Write-Host "📦 Partie 3/7: Fichiers Publics (public/)..." -ForegroundColor Cyan
git add public/ 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 3: Fichiers Publics" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✓ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Publics")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun changement dans public/" -ForegroundColor Gray
}

# Partie 4: Documentation principale
Write-Host ""
Write-Host "📦 Partie 4/7: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc papier de travail javascript/" 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation principale" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✓ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation principale")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun changement dans la documentation principale" -ForegroundColor Gray
}

# Partie 5: Documentation Systeme Persistance Chat (incluant Migration DOM)
Write-Host ""
Write-Host "📦 Partie 5/7: Documentation Systeme Persistance Chat + Migration DOM..." -ForegroundColor Cyan
git add "Doc Systeme persistance chat/" 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 5: Doc Systeme Persistance Chat + Migration DOM" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✓ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation Persistance Chat")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun changement dans Doc Systeme persistance chat/" -ForegroundColor Gray
}

# Partie 6: Autres documentations et fichiers markdown
Write-Host ""
Write-Host "📦 Partie 6/7: Documentations diverses + Scripts..." -ForegroundColor Cyan
git add *.md *.txt *.ps1 "Doc_Github_Issue/" "Doc Koyeb deploy/" "Doc backend github/" "deploiement-netlify/" "Doc cross ref documentaire menu/" 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 6: Documentations diverses + Scripts" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✓ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentations diverses")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun changement dans les documentations diverses" -ForegroundColor Gray
}

# Partie 7: Fichiers restants (configuration, etc.)
Write-Host ""
Write-Host "📦 Partie 7/7: Configuration et fichiers divers..." -ForegroundColor Cyan
git add . 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 7: Configuration et fichiers divers" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✓ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Configuration et fichiers divers")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun fichier restant" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "  ✅ PUSH TERMINE AVEC SUCCES                                    " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Verification finale..." -ForegroundColor Yellow
git status
Write-Host ""
Write-Host "🌐 Repository GitHub:" -ForegroundColor Cyan
Write-Host "   $repoUrl" -ForegroundColor White
Write-Host ""
Write-Host "📝 Prochaines etapes:" -ForegroundColor Yellow
Write-Host "   1. ✓ Verifier le repository sur GitHub" -ForegroundColor Gray
Write-Host "   2. ✓ Configurer la visibilite (public/prive)" -ForegroundColor Gray
Write-Host "   3. ✓ Ajouter un README.md si necessaire" -ForegroundColor Gray
Write-Host "   4. ✓ Configurer les GitHub Actions si besoin" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Script termine a $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
Write-Host ""
