# Script de push en commits multiples pour projet 140 MB
# ClaraVerse - 06 Octobre 2026
# Version: Persistance Encours + Isolation Chat OK + Migration DOM V1.4

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse V1.4 - 06 Octobre 2026                         " -ForegroundColor Cyan
Write-Host "  Persistance Encours + Isolation Chat + Migration DOM           " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claraveverse_06__10-2026_persistance_encours_isolation_chat_OK_migration_DOM_V1.4.git"
$branche = "main"
$commitPrefix = "Sauvegarde ClaraVerse V1.4 - 06 Oct 2026"

# Fonction pour push avec retry
function Push-WithRetry {
    param(
        [string]$message,
        [int]$maxRetries = 3
    )
    
    $retry = 0
    while ($retry -lt $maxRetries) {
        Write-Host "  Push tentative $($retry + 1)/$maxRetries..." -ForegroundColor Gray
        
        git push origin $branche 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Push reussi: $message" -ForegroundColor Green
            return $true
        }
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  Echec, nouvelle tentative dans 10 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
    
    Write-Host "  Push echoue apres $maxRetries tentatives" -ForegroundColor Red
    return $false
}

# Etape 1: Verifier l'etat Git
Write-Host "1. Verification de l'etat Git..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "  Fichiers modifies detectes" -ForegroundColor White
} else {
    Write-Host "  Aucun fichier modifie" -ForegroundColor Green
}

# Etape 2: Verifier le commit existant
Write-Host ""
Write-Host "2. Verification du dernier commit..." -ForegroundColor Yellow
$lastCommit = git log -1 --oneline 2>&1
Write-Host "  Dernier commit: $lastCommit" -ForegroundColor Gray

# Etape 3: Configuration Git optimale
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
Write-Host "  Configuration appliquee" -ForegroundColor Green

# Etape 4: Verifier et configurer le remote
Write-Host ""
Write-Host "4. Configuration du repository distant..." -ForegroundColor Yellow
git remote set-url origin $repoUrl
$remoteCheck = git remote -v
Write-Host "  Repository cible configure" -ForegroundColor Green
Write-Host "  $($remoteCheck[0])" -ForegroundColor Gray

# Etape 5: Verifier la connexion
Write-Host ""
Write-Host "5. Test de connexion au repository..." -ForegroundColor Yellow
$lsRemote = git ls-remote origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Connexion reussie" -ForegroundColor Green
} else {
    Write-Host "  Le repository sera cree lors du premier push" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  DEBUT DU PUSH EN 7 PARTIES (chaque partie moins de 30 MB)      " -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# Partie 1: Code Source React/TypeScript
Write-Host ""
Write-Host "Partie 1/7: Code Source React/TypeScript (src/)..." -ForegroundColor Cyan
git add src/
$commitResult = git commit -m "$commitPrefix - Partie 1: Code Source React/TypeScript" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Code Source React/TypeScript")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun changement dans src/" -ForegroundColor Yellow
}

# Partie 2: Backend Python
Write-Host ""
Write-Host "Partie 2/7: Backend Python (py_backend/)..." -ForegroundColor Cyan
git add py_backend/
$commitResult = git commit -m "$commitPrefix - Partie 2: Backend Python" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Backend Python")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun changement dans py_backend/" -ForegroundColor Yellow
}

# Partie 3: Fichiers Publics
Write-Host ""
Write-Host "Partie 3/7: Fichiers Publics (public/)..." -ForegroundColor Cyan
git add public/
$commitResult = git commit -m "$commitPrefix - Partie 3: Fichiers Publics" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Publics")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun changement dans public/" -ForegroundColor Yellow
}

# Partie 4: Documentation principale
Write-Host ""
Write-Host "Partie 4/7: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc papier de travail javascript/"
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation principale" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation principale")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun changement dans la documentation principale" -ForegroundColor Yellow
}

# Partie 5: Documentation Systeme Persistance Chat
Write-Host ""
Write-Host "Partie 5/7: Doc Systeme Persistance Chat + Migration DOM..." -ForegroundColor Cyan
git add "Doc Systeme persistance chat/"
$commitResult = git commit -m "$commitPrefix - Partie 5: Doc Systeme Persistance Chat + Migration DOM" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation Persistance Chat")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun changement dans Doc Systeme persistance chat/" -ForegroundColor Yellow
}

# Partie 6: Autres documentations et scripts
Write-Host ""
Write-Host "Partie 6/7: Documentations diverses + Scripts..." -ForegroundColor Cyan
git add *.md *.txt *.ps1 "Doc_Github_Issue/" "Doc Koyeb deploy/" "Doc backend github/" "deploiement-netlify/" "Doc cross ref documentaire menu/"
$commitResult = git commit -m "$commitPrefix - Partie 6: Documentations diverses + Scripts" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentations diverses")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun changement dans les documentations diverses" -ForegroundColor Yellow
}

# Partie 7: Fichiers restants
Write-Host ""
Write-Host "Partie 7/7: Configuration et fichiers divers..." -ForegroundColor Cyan
git add .
$commitResult = git commit -m "$commitPrefix - Partie 7: Configuration et fichiers divers" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Configuration et fichiers divers")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier restant" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "           PUSH TERMINE AVEC SUCCES                              " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verification finale..." -ForegroundColor Yellow
git status
Write-Host ""
Write-Host "Repository GitHub:" -ForegroundColor Cyan
Write-Host "   $repoUrl" -ForegroundColor White
Write-Host ""
Write-Host "Prochaines etapes recommandees:" -ForegroundColor Yellow
Write-Host "   1. Verifier le repository sur GitHub" -ForegroundColor Gray
Write-Host "   2. Configurer la visibilite (public/prive)" -ForegroundColor Gray
Write-Host "   3. Ajouter un README.md si necessaire" -ForegroundColor Gray
Write-Host ""
