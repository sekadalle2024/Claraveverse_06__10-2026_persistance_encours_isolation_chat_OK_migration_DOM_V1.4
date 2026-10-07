/**
 * 🔧 VÉRIFICATION INSTALLATION SOLUTION
 * Script de vérification rapide que tous les fichiers sont bien en place
 * Date: 6 Octobre 2026
 */

(function() {
  'use strict';
  
  console.log("═══════════════════════════════════════════════════════");
  console.log("🔧 VÉRIFICATION INSTALLATION SOLUTION");
  console.log("═══════════════════════════════════════════════════════\n");
  
  const checks = [];
  
  // ==========================================
  // CHECK 1 : SCRIPTS CHARGÉS
  // ==========================================
  
  console.log("1️⃣ Vérification scripts chargés...\n");
  
  const scripts = [
    { name: 'stableSessionManager', obj: window.stableSessionManager, critical: true },
    { name: 'domStorageManager', obj: window.domStorageManager, critical: true },
    { name: 'domRestoreManager', obj: window.domRestoreManager, critical: true },
    { name: 'domAutoSave', obj: window.domAutoSave, critical: false },
    { name: 'domCheckpointSaver', obj: window.domCheckpointSaver, critical: false },
    { name: 'runDiagnosticTablesNonPersistantes', obj: window.runDiagnosticTablesNonPersistantes, critical: false }
  ];
  
  scripts.forEach(script => {
    const loaded = !!script.obj;
    const icon = loaded ? '✅' : (script.critical ? '❌' : '⚠️');
    console.log(`   ${icon} ${script.name}: ${loaded ? 'Chargé' : 'Absent'}`);
    
    checks.push({
      category: 'Scripts',
      name: script.name,
      passed: loaded,
      critical: script.critical
    });
  });
  
  console.log("\n");
  
  // ==========================================
  // CHECK 2 : SESSIONID STABLE
  // ==========================================
  
  console.log("2️⃣ Vérification SessionId stable...\n");
  
  if (window.stableSessionManager) {
    const sessionId = window.stableSessionManager.getSessionId();
    const isStable = sessionId && sessionId.startsWith('stable_session_');
    const icon = isStable ? '✅' : '⚠️';
    
    console.log(`   ${icon} SessionId: ${sessionId}`);
    console.log(`   ${icon} Format stable: ${isStable ? 'OUI' : 'NON (sera corrigé au prochain rechargement)'}`);
    
    // Vérifier localStorage
    const lsSessionId = localStorage.getItem('claraverse_stable_session_id');
    console.log(`   ${lsSessionId ? '✅' : '⚠️'} LocalStorage: ${lsSessionId || 'Absent (sera créé)'}`);
    
    checks.push({
      category: 'SessionId',
      name: 'SessionId stable',
      passed: !!sessionId,
      critical: true
    });
  } else {
    console.log(`   ❌ stableSessionManager non chargé !`);
    checks.push({
      category: 'SessionId',
      name: 'SessionId stable',
      passed: false,
      critical: true
    });
  }
  
  console.log("\n");
  
  // ==========================================
  // CHECK 3 : FONCTIONS CRITIQUES
  // ==========================================
  
  console.log("3️⃣ Vérification fonctions critiques...\n");
  
  const functions = [
    { 
      name: 'getStableSessionId (DOM Storage)', 
      check: () => typeof window.domStorageManager?.getStableSessionId === 'function',
      critical: true
    },
    { 
      name: 'getStableSessionId (DOM Restore)', 
      check: () => typeof window.domRestoreManager?.getStableSessionId === 'function',
      critical: true
    },
    { 
      name: 'stableSessionManager.diagnose', 
      check: () => typeof window.stableSessionManager?.diagnose === 'function',
      critical: false
    }
  ];
  
  functions.forEach(func => {
    const exists = func.check();
    const icon = exists ? '✅' : (func.critical ? '❌' : '⚠️');
    console.log(`   ${icon} ${func.name}: ${exists ? 'Présente' : 'Absente'}`);
    
    checks.push({
      category: 'Fonctions',
      name: func.name,
      passed: exists,
      critical: func.critical
    });
  });
  
  console.log("\n");
  
  // ==========================================
  // CHECK 4 : AUTO-RESTAURATION
  // ==========================================
  
  console.log("4️⃣ Vérification auto-restauration...\n");
  
  if (window.domRestoreManager) {
    const lastRestore = window.domRestoreManager.lastRestoreTime;
    const hasRestored = lastRestore > 0;
    const timeSince = hasRestored ? Math.floor((Date.now() - lastRestore) / 1000) : 0;
    
    console.log(`   ${hasRestored ? '✅' : '⚠️'} Restauration appelée: ${hasRestored ? 'OUI' : 'PAS ENCORE (normale si page vient de charger)'}`);
    if (hasRestored) {
      console.log(`   ℹ️  Dernière restauration: il y a ${timeSince} seconde(s)`);
    }
    
    checks.push({
      category: 'Restauration',
      name: 'Auto-restauration',
      passed: true, // Non critique si pas encore appelée
      critical: false
    });
  } else {
    console.log(`   ❌ domRestoreManager non chargé !`);
    checks.push({
      category: 'Restauration',
      name: 'Auto-restauration',
      passed: false,
      critical: true
    });
  }
  
  console.log("\n");
  
  // ==========================================
  // CHECK 5 : BOUTON DIAGNOSTIC
  // ==========================================
  
  console.log("5️⃣ Vérification bouton diagnostic...\n");
  
  // Chercher bouton dans le DOM
  const buttons = Array.from(document.querySelectorAll('button'));
  const diagnosticButton = buttons.find(b => b.textContent.includes('Diagnostic Tables'));
  
  if (diagnosticButton) {
    console.log(`   ✅ Bouton "Diagnostic Tables" trouvé`);
    console.log(`   ℹ️  Position: ${diagnosticButton.style.position || 'relative'}`);
    checks.push({
      category: 'Interface',
      name: 'Bouton Diagnostic Tables',
      passed: true,
      critical: false
    });
  } else {
    console.log(`   ⚠️ Bouton "Diagnostic Tables" non trouvé`);
    console.log(`   → Sera visible après rechargement si index.html modifié`);
    checks.push({
      category: 'Interface',
      name: 'Bouton Diagnostic Tables',
      passed: false,
      critical: false
    });
  }
  
  console.log("\n");
  
  // ==========================================
  // CHECK 6 : COMPATIBILITÉ window.currentSessionId
  // ==========================================
  
  console.log("6️⃣ Vérification compatibilité...\n");
  
  try {
    const currentSessionId = window.currentSessionId;
    const stableSessionId = window.stableSessionManager?.getSessionId();
    const match = currentSessionId === stableSessionId;
    
    console.log(`   ${match ? '✅' : '⚠️'} window.currentSessionId: ${currentSessionId || 'undefined'}`);
    console.log(`   ${match ? '✅' : '⚠️'} Synchronisé avec stableSessionManager: ${match ? 'OUI' : 'NON'}`);
    
    checks.push({
      category: 'Compatibilité',
      name: 'window.currentSessionId',
      passed: !!currentSessionId,
      critical: false
    });
  } catch (error) {
    console.log(`   ❌ Erreur vérification currentSessionId:`, error.message);
    checks.push({
      category: 'Compatibilité',
      name: 'window.currentSessionId',
      passed: false,
      critical: false
    });
  }
  
  console.log("\n");
  
  // ==========================================
  // SYNTHÈSE
  // ==========================================
  
  console.log("═══════════════════════════════════════════════════════");
  console.log("📊 SYNTHÈSE");
  console.log("═══════════════════════════════════════════════════════\n");
  
  const totalChecks = checks.length;
  const passedChecks = checks.filter(c => c.passed).length;
  const criticalChecks = checks.filter(c => c.critical).length;
  const criticalFailed = checks.filter(c => c.critical && !c.passed).length;
  
  console.log(`✅ Checks réussis: ${passedChecks}/${totalChecks}`);
  console.log(`❌ Checks échoués: ${totalChecks - passedChecks}/${totalChecks}`);
  console.log(`🚨 Critiques échoués: ${criticalFailed}/${criticalChecks}\n`);
  
  // Diagnostic par catégorie
  const categories = [...new Set(checks.map(c => c.category))];
  
  console.log("📋 Par catégorie:\n");
  categories.forEach(cat => {
    const catChecks = checks.filter(c => c.category === cat);
    const catPassed = catChecks.filter(c => c.passed).length;
    const icon = catPassed === catChecks.length ? '✅' : (catPassed > 0 ? '⚠️' : '❌');
    console.log(`   ${icon} ${cat}: ${catPassed}/${catChecks.length}`);
  });
  
  console.log("\n");
  
  // ==========================================
  // RECOMMANDATIONS
  // ==========================================
  
  if (criticalFailed > 0) {
    console.log("═══════════════════════════════════════════════════════");
    console.log("🚨 PROBLÈMES CRITIQUES DÉTECTÉS");
    console.log("═══════════════════════════════════════════════════════\n");
    
    const criticalFailures = checks.filter(c => c.critical && !c.passed);
    criticalFailures.forEach((check, i) => {
      console.log(`${i + 1}. ❌ ${check.name} (${check.category})`);
    });
    
    console.log("\n⚡ ACTIONS REQUISES:\n");
    
    if (criticalFailures.some(c => c.name === 'stableSessionManager')) {
      console.log("1. Vérifier que stable-session-manager.js est chargé dans index.html");
      console.log("   → Doit être EN PREMIER (avant dom-storage-manager.js)\n");
    }
    
    if (criticalFailures.some(c => c.name === 'domStorageManager')) {
      console.log("2. Vérifier que dom-storage-manager.js est chargé");
      console.log("   → Vérifier chemin: /dom-storage-manager.js\n");
    }
    
    if (criticalFailures.some(c => c.name === 'domRestoreManager')) {
      console.log("3. Vérifier que dom-restore-manager.js est chargé");
      console.log("   → Vérifier chemin: /dom-restore-manager.js\n");
    }
    
    console.log("💡 Solution générale: Recharger page avec cache vidé (Ctrl+Shift+R)\n");
    
  } else if (passedChecks < totalChecks) {
    console.log("═══════════════════════════════════════════════════════");
    console.log("⚠️ AVERTISSEMENTS (non critiques)");
    console.log("═══════════════════════════════════════════════════════\n");
    
    const warnings = checks.filter(c => !c.critical && !c.passed);
    warnings.forEach((check, i) => {
      console.log(`${i + 1}. ⚠️ ${check.name} (${check.category})`);
    });
    
    console.log("\n💡 Ces éléments sont optionnels ou se corrigeront automatiquement.\n");
    
  } else {
    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ INSTALLATION COMPLÈTE ET FONCTIONNELLE");
    console.log("═══════════════════════════════════════════════════════\n");
    
    console.log("🎉 Tous les checks sont passés !\n");
    console.log("📝 Prochaines étapes:\n");
    console.log("1. Générer des tables (demander à GPT)");
    console.log("2. Actualiser page (F5)");
    console.log("3. Vérifier que tables réapparaissent\n");
    console.log("💡 Commande test: stableSessionManager.diagnose()\n");
  }
  
  console.log("═══════════════════════════════════════════════════════\n");
  
  // Exposer résultats
  window.verifInstallation = {
    checks: checks,
    summary: {
      total: totalChecks,
      passed: passedChecks,
      failed: totalChecks - passedChecks,
      criticalFailed: criticalFailed
    }
  };
  
  console.log("💾 Résultats sauvegardés dans: window.verifInstallation");
  console.log("💾 Copier avec: copy(verifInstallation)\n");
  
})();
