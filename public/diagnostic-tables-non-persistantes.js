/**
 * 🔍 DIAGNOSTIC TABLES NON PERSISTANTES
 * Script de diagnostic automatisé pour identifier pourquoi certaines tables ne persistent pas
 * Date: 6 Octobre 2026
 */

(function() {
  'use strict';
  
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║  🔍 DIAGNOSTIC TABLES NON PERSISTANTES                        ║");
  console.log("║  Date: 6 Octobre 2026                                         ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };
  
  // ==========================================
  // TEST 1 : VÉRIFIER SESSIONID
  // ==========================================
  
  function test1_VerifySessionId() {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 TEST 1 : Vérification SessionId");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    const test = {
      id: 'test1',
      name: 'Vérification SessionId',
      details: []
    };
    
    // 1.1. currentSessionId
    const currentSessionId = window.currentSessionId;
    console.log("1️⃣ window.currentSessionId:", currentSessionId || '❌ UNDEFINED');
    test.details.push({
      check: 'currentSessionId',
      value: currentSessionId,
      status: currentSessionId ? 'passed' : 'failed'
    });
    
    // 1.2. localStorage
    const lsSessionId = localStorage.getItem('currentSessionId');
    console.log("2️⃣ localStorage.currentSessionId:", lsSessionId || '❌ UNDEFINED');
    test.details.push({
      check: 'localStorage.currentSessionId',
      value: lsSessionId,
      status: lsSessionId ? 'passed' : 'failed'
    });
    
    // 1.3. claraverse_stable_session_id
    const stableSessionId = localStorage.getItem('claraverse_stable_session_id');
    console.log("3️⃣ localStorage.claraverse_stable_session_id:", stableSessionId || '❌ UNDEFINED');
    test.details.push({
      check: 'stableSessionId',
      value: stableSessionId,
      status: stableSessionId ? 'passed' : 'warning'
    });
    
    // 1.4. Sessions dans DOM Storage
    const container = document.getElementById('claraverse-dom-storage');
    if (container) {
      const sessions = container.querySelectorAll('[data-session-id]');
      const sessionIds = Array.from(sessions).map(s => s.dataset.sessionId);
      
      console.log("\n4️⃣ Sessions dans DOM Storage:");
      sessionIds.forEach((id, i) => {
        console.log(`   ${i + 1}. ${id}`);
      });
      
      test.details.push({
        check: 'domStorageSessions',
        value: sessionIds,
        count: sessionIds.length,
        status: 'info'
      });
      
      // 1.5. Vérifier si sessionId actuel existe dans storage
      const currentExistsInStorage = sessionIds.includes(currentSessionId);
      const lsExistsInStorage = sessionIds.includes(lsSessionId);
      
      console.log("\n5️⃣ Correspondance SessionId:");
      console.log(`   currentSessionId existe dans storage: ${currentExistsInStorage ? '✅ OUI' : '❌ NON'}`);
      console.log(`   localStorage sessionId existe dans storage: ${lsExistsInStorage ? '✅ OUI' : '❌ NON'}`);
      
      test.details.push({
        check: 'sessionIdMatch',
        currentMatch: currentExistsInStorage,
        localStorageMatch: lsExistsInStorage,
        status: (currentExistsInStorage || lsExistsInStorage) ? 'passed' : 'failed'
      });
      
      // ⚠️ DIAGNOSTIC PRINCIPAL
      if (!currentExistsInStorage && !lsExistsInStorage && sessionIds.length > 0) {
        console.log("\n❌ ❌ ❌ PROBLÈME DÉTECTÉ ❌ ❌ ❌");
        console.log("→ SessionId actuel NE CORRESPOND PAS aux sessions stockées");
        console.log("→ CAUSE PROBABLE: SessionId change entre sauvegarde et restauration");
        console.log("→ SOLUTION: Implémenter SessionId stable (voir doc Solution 1)");
        test.diagnosis = "SessionId mismatch - Hypothèse 1.1 confirmée";
      }
      
    } else {
      console.log("❌ DOM Storage container introuvable !");
      test.details.push({
        check: 'domStorageContainer',
        status: 'failed',
        message: 'Container introuvable'
      });
    }
    
    test.passed = test.details.some(d => d.status === 'passed');
    results.tests.push(test);
    
    console.log("\n");
  }
  
  // ==========================================
  // TEST 2 : VÉRIFIER RESTAURATION
  // ==========================================
  
  function test2_VerifyRestoration() {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 TEST 2 : Vérification Restauration");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    const test = {
      id: 'test2',
      name: 'Vérification Restauration',
      details: []
    };
    
    // 2.1. Vérifier si DOMRestoreManager existe
    if (!window.domRestoreManager) {
      console.log("❌ window.domRestoreManager INTROUVABLE");
      test.details.push({
        check: 'domRestoreManager',
        status: 'failed',
        message: 'Manager non chargé'
      });
      test.passed = false;
      results.tests.push(test);
      return;
    }
    
    console.log("✅ window.domRestoreManager chargé");
    
    // 2.2. Vérifier lastRestoreTime
    const lastRestoreTime = window.domRestoreManager.lastRestoreTime;
    const now = Date.now();
    const timeSinceRestore = now - lastRestoreTime;
    
    console.log(`\n1️⃣ lastRestoreTime: ${lastRestoreTime}`);
    
    if (lastRestoreTime === 0) {
      console.log("   ⚠️ Restauration JAMAIS appelée depuis chargement page");
      console.log("   → PROBLÈME: Restauration automatique ne fonctionne pas");
      console.log("   → SOLUTION: Implémenter auto-restauration (voir doc Solution 4)");
      test.details.push({
        check: 'lastRestoreTime',
        value: 0,
        status: 'failed',
        message: 'Jamais appelée'
      });
      test.diagnosis = "Restauration jamais appelée - Hypothèse restauration manquante confirmée";
    } else {
      const secondsAgo = Math.floor(timeSinceRestore / 1000);
      console.log(`   ✅ Dernière restauration: il y a ${secondsAgo} seconde(s)`);
      test.details.push({
        check: 'lastRestoreTime',
        value: lastRestoreTime,
        secondsAgo: secondsAgo,
        status: 'passed'
      });
    }
    
    // 2.3. Vérifier isRestoring
    console.log(`\n2️⃣ isRestoring: ${window.domRestoreManager.isRestoring ? '⏳ EN COURS' : '✅ Prêt'}`);
    test.details.push({
      check: 'isRestoring',
      value: window.domRestoreManager.isRestoring,
      status: 'info'
    });
    
    // 2.4. Forcer restauration manuelle pour tester
    console.log("\n3️⃣ Test restauration forcée...");
    const sessionId = window.currentSessionId || localStorage.getItem('currentSessionId');
    
    if (!sessionId) {
      console.log("   ❌ Impossible: sessionId introuvable");
      test.details.push({
        check: 'forceRestore',
        status: 'failed',
        message: 'SessionId introuvable'
      });
    } else {
      console.log(`   SessionId utilisé: ${sessionId}`);
      console.log("   Appel forceRestore()...\n");
      
      // Capturer les logs de restauration
      const originalLog = console.log;
      const logs = [];
      console.log = function(...args) {
        logs.push(args.join(' '));
        originalLog.apply(console, args);
      };
      
      try {
        window.domRestoreManager.forceRestore(sessionId);
        
        // Attendre un peu pour les logs asynchrones
        setTimeout(() => {
          console.log = originalLog;
          
          const restoredCount = logs.filter(l => l.includes('Table UI créée') || l.includes('Table UI mise à jour')).length;
          console.log(`\n   ✅ Restauration terminée: ${restoredCount} table(s)`);
          
          test.details.push({
            check: 'forceRestore',
            status: 'passed',
            restoredCount: restoredCount,
            logs: logs.slice(0, 10) // Garder premiers 10 logs
          });
          
          if (restoredCount === 0) {
            console.log("   ⚠️ Aucune table restaurée (soit vide, soit problème)");
          }
        }, 1000);
        
      } catch (error) {
        console.log = originalLog;
        console.log(`   ❌ Erreur: ${error.message}`);
        test.details.push({
          check: 'forceRestore',
          status: 'failed',
          error: error.message
        });
      }
    }
    
    test.passed = test.details.some(d => d.status === 'passed');
    results.tests.push(test);
    
    console.log("\n");
  }
  
  // ==========================================
  // TEST 3 : COMPARER KEYWORDS STORAGE VS UI
  // ==========================================
  
  function test3_CompareKeywords() {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 TEST 3 : Comparaison Keywords Storage vs UI");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    const test = {
      id: 'test3',
      name: 'Comparaison Keywords',
      details: []
    };
    
    // 3.1. Keywords dans storage
    const sessionId = window.currentSessionId || localStorage.getItem('currentSessionId');
    
    if (!sessionId || !window.domStorageManager) {
      console.log("❌ Impossible: sessionId ou domStorageManager introuvable");
      test.passed = false;
      results.tests.push(test);
      return;
    }
    
    const storedTables = window.domStorageManager.restoreAllTables(sessionId);
    const storedKeywords = storedTables.map(t => t.keyword);
    
    console.log("📦 Keywords dans DOM Storage:");
    storedKeywords.forEach((k, i) => {
      console.log(`   ${i + 1}. ${k}`);
    });
    
    test.details.push({
      check: 'storedKeywords',
      value: storedKeywords,
      count: storedKeywords.length,
      status: 'info'
    });
    
    // 3.2. Keywords dans UI (visibles)
    const visibleTables = Array.from(document.querySelectorAll('table[data-keyword]'))
      .filter(t => !t.closest('#claraverse-dom-storage'));
    const visibleKeywords = visibleTables.map(t => t.dataset.keyword);
    
    console.log("\n👁️ Keywords dans UI (visibles):");
    visibleKeywords.forEach((k, i) => {
      console.log(`   ${i + 1}. ${k}`);
    });
    
    test.details.push({
      check: 'visibleKeywords',
      value: visibleKeywords,
      count: visibleKeywords.length,
      status: 'info'
    });
    
    // 3.3. Comparer
    const missing = storedKeywords.filter(k => !visibleKeywords.includes(k));
    const extra = visibleKeywords.filter(k => !storedKeywords.includes(k));
    
    console.log("\n🔍 Analyse:");
    
    if (missing.length > 0) {
      console.log("\n❌ Tables MANQUANTES (stockées mais pas visibles):");
      missing.forEach((k, i) => {
        console.log(`   ${i + 1}. ${k}`);
      });
      test.details.push({
        check: 'missingTables',
        value: missing,
        count: missing.length,
        status: 'failed',
        message: 'Tables stockées mais non restaurées'
      });
      
      // Vérifier si Table_Consolidation ou Légende manquantes
      if (missing.includes('Table_Consolidation')) {
        console.log("\n❌ ❌ Table_Consolidation CONFIRMÉE MANQUANTE");
      }
      if (missing.includes('Lgende') || missing.includes('Légende') || missing.includes('Legende')) {
        console.log("\n❌ ❌ Table Légende CONFIRMÉE MANQUANTE");
      }
    } else {
      console.log("   ✅ Toutes les tables stockées sont visibles");
      test.details.push({
        check: 'missingTables',
        count: 0,
        status: 'passed'
      });
    }
    
    if (extra.length > 0) {
      console.log("\n⚠️ Tables EN TROP (visibles mais pas stockées):");
      extra.forEach((k, i) => {
        console.log(`   ${i + 1}. ${k}`);
      });
      test.details.push({
        check: 'extraTables',
        value: extra,
        count: extra.length,
        status: 'warning',
        message: 'Tables visibles mais non sauvegardées'
      });
    } else {
      console.log("   ✅ Aucune table en trop");
      test.details.push({
        check: 'extraTables',
        count: 0,
        status: 'passed'
      });
    }
    
    // 3.4. Détecter keywords similaires (problème accent)
    console.log("\n🔎 Détection keywords similaires (problème accent possible):");
    let similarFound = false;
    
    storedKeywords.forEach(stored => {
      const normalized = stored.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const similar = visibleKeywords.find(visible => {
        const visibleNormalized = visible.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return visibleNormalized === normalized && visible !== stored;
      });
      
      if (similar) {
        console.log(`   ⚠️ "${stored}" (storage) vs "${similar}" (UI) → Accents différents`);
        similarFound = true;
      }
    });
    
    if (similarFound) {
      console.log("\n❌ PROBLÈME DÉTECTÉ: Keywords avec accents incohérents");
      console.log("→ SOLUTION: Normaliser keywords (voir doc Solution 2)");
      test.diagnosis = "Keywords avec accents - Hypothèse 2 confirmée";
    } else if (!similarFound) {
      console.log("   ✅ Aucun problème d'accent détecté");
    }
    
    test.passed = missing.length === 0;
    results.tests.push(test);
    
    console.log("\n");
  }
  
  // ==========================================
  // TEST 4 : TRACER TABLE_CONSOLIDATION
  // ==========================================
  
  function test4_TraceTableConso() {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 TEST 4 : Traçage Table_Consolidation");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    const test = {
      id: 'test4',
      name: 'Traçage Table_Consolidation',
      details: []
    };
    
    // 4.1. Tables conso dans UI
    const consoTablesUI = document.querySelectorAll('.claraverse-conso-table');
    console.log(`1️⃣ Tables .claraverse-conso-table dans UI: ${consoTablesUI.length}`);
    
    if (consoTablesUI.length > 0) {
      consoTablesUI.forEach((table, i) => {
        console.log(`\n   Table ${i + 1}:`);
        console.log(`     Keyword: ${table.dataset.keyword || '❌ MANQUANT'}`);
        console.log(`     TableId: ${table.dataset.tableId || '❌ MANQUANT'}`);
        console.log(`     Lignes: ${table.querySelectorAll('tr').length}`);
        console.log(`     Classes: ${table.className}`);
        
        test.details.push({
          check: `consoTable_${i}`,
          keyword: table.dataset.keyword,
          tableId: table.dataset.tableId,
          rows: table.querySelectorAll('tr').length,
          status: table.dataset.keyword ? 'passed' : 'failed'
        });
      });
    } else {
      console.log("   ℹ️ Aucune table de consolidation visible");
      console.log("   → Générez d'abord une table (ex: 'Crée un programme de travail')");
      test.details.push({
        check: 'consoTablesUI',
        count: 0,
        status: 'info',
        message: 'Aucune table générée'
      });
    }
    
    // 4.2. Table_Consolidation dans storage
    const sessionId = window.currentSessionId || localStorage.getItem('currentSessionId');
    
    if (sessionId && window.domStorageManager) {
      const storedTables = window.domStorageManager.restoreAllTables(sessionId);
      const consoStored = storedTables.find(t => 
        t.keyword === 'Table_Consolidation' || 
        t.keyword.includes('Consolidation')
      );
      
      console.log(`\n2️⃣ Table_Consolidation dans storage:`);
      
      if (consoStored) {
        console.log(`   ✅ TROUVÉE`);
        console.log(`     Keyword: ${consoStored.keyword}`);
        console.log(`     Lignes: ${consoStored.element.querySelectorAll('tr').length}`);
        console.log(`     Taille HTML: ${consoStored.element.outerHTML.length} chars`);
        
        test.details.push({
          check: 'consoInStorage',
          found: true,
          keyword: consoStored.keyword,
          rows: consoStored.element.querySelectorAll('tr').length,
          status: 'passed'
        });
      } else {
        console.log(`   ❌ NON TROUVÉE`);
        console.log(`   → Soit jamais générée, soit keyword différent`);
        
        // Lister tous les keywords pour aider
        console.log(`\n   Keywords disponibles dans storage:`);
        storedTables.forEach((t, i) => {
          console.log(`     ${i + 1}. ${t.keyword}`);
        });
        
        test.details.push({
          check: 'consoInStorage',
          found: false,
          status: 'failed',
          availableKeywords: storedTables.map(t => t.keyword)
        });
      }
    }
    
    // 4.3. Diagnostic
    const consoInUI = consoTablesUI.length > 0;
    const consoInStorage = test.details.some(d => d.check === 'consoInStorage' && d.found);
    
    console.log("\n3️⃣ Diagnostic:");
    
    if (!consoInUI && !consoInStorage) {
      console.log("   ℹ️ Table_Consolidation jamais générée (normal)");
    } else if (consoInUI && !consoInStorage) {
      console.log("   ❌ PROBLÈME: Table visible MAIS pas dans storage");
      console.log("   → Table générée mais sauvegarde a échoué");
      console.log("   → Vérifier logs de sauvegarde dans console");
      test.diagnosis = "Table visible mais non sauvegardée";
    } else if (!consoInUI && consoInStorage) {
      console.log("   ❌ PROBLÈME: Table stockée MAIS pas visible");
      console.log("   → Restauration a échoué");
      console.log("   → Confirme problèmes détectés dans Test 1 ou Test 2");
      test.diagnosis = "Table stockée mais non restaurée - Confirme Hypothèse 1 ou 3";
    } else {
      console.log("   ✅ Table visible ET stockée (état normal)");
    }
    
    test.passed = test.details.length > 0;
    results.tests.push(test);
    
    console.log("\n");
  }
  
  // ==========================================
  // TEST 5 : TRACER TABLE LÉGENDE
  // ==========================================
  
  function test5_TraceTableLegend() {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 TEST 5 : Traçage Table Légende");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    const test = {
      id: 'test5',
      name: 'Traçage Table Légende',
      details: []
    };
    
    // 5.1. Chercher tables avec "Légende" ou "Lgende" dans keyword
    const allVisibleTables = Array.from(document.querySelectorAll('table[data-keyword]'))
      .filter(t => !t.closest('#claraverse-dom-storage'));
    
    const legendTables = allVisibleTables.filter(t => {
      const kw = t.dataset.keyword.toLowerCase();
      return kw.includes('legende') || kw.includes('légende') || kw.includes('lgende');
    });
    
    console.log(`1️⃣ Tables "Légende" dans UI: ${legendTables.length}`);
    
    if (legendTables.length > 0) {
      legendTables.forEach((table, i) => {
        console.log(`\n   Table ${i + 1}:`);
        console.log(`     Keyword: ${table.dataset.keyword}`);
        console.log(`     Premier header: ${table.querySelector('th')?.textContent || 'N/A'}`);
        console.log(`     Lignes: ${table.querySelectorAll('tr').length}`);
        
        test.details.push({
          check: `legendTable_${i}`,
          keyword: table.dataset.keyword,
          firstHeader: table.querySelector('th')?.textContent,
          rows: table.querySelectorAll('tr').length,
          status: 'info'
        });
      });
    } else {
      console.log("   ℹ️ Aucune table Légende visible");
    }
    
    // 5.2. Chercher dans storage
    const sessionId = window.currentSessionId || localStorage.getItem('currentSessionId');
    
    if (sessionId && window.domStorageManager) {
      const storedTables = window.domStorageManager.restoreAllTables(sessionId);
      const legendStored = storedTables.filter(t => {
        const kw = t.keyword.toLowerCase();
        return kw.includes('legende') || kw.includes('légende') || kw.includes('lgende');
      });
      
      console.log(`\n2️⃣ Tables "Légende" dans storage: ${legendStored.length}`);
      
      if (legendStored.length > 0) {
        legendStored.forEach((t, i) => {
          console.log(`\n   Table ${i + 1}:`);
          console.log(`     Keyword: ${t.keyword}`);
          console.log(`     Lignes: ${t.element.querySelectorAll('tr').length}`);
          
          test.details.push({
            check: `legendStored_${i}`,
            keyword: t.keyword,
            rows: t.element.querySelectorAll('tr').length,
            status: 'info'
          });
        });
      } else {
        console.log("   ❌ Aucune table Légende dans storage");
      }
    }
    
    // 5.3. Détecter problème accent
    const variations = ['Lgende', 'Légende', 'Legende', 'legende', 'légende', 'lgende'];
    const foundVariations = [];
    
    const sessionId2 = window.currentSessionId || localStorage.getItem('currentSessionId');
    if (sessionId2 && window.domStorageManager) {
      const allStored = window.domStorageManager.restoreAllTables(sessionId2);
      
      variations.forEach(variant => {
        if (allStored.some(t => t.keyword === variant)) {
          foundVariations.push(variant);
        }
      });
    }
    
    if (foundVariations.length > 1) {
      console.log("\n⚠️ ATTENTION: Plusieurs variations de 'Légende' détectées:");
      foundVariations.forEach(v => console.log(`   - "${v}"`));
      console.log("   → Problème d'accent confirmé");
      test.diagnosis = "Variations orthographiques multiples - Hypothèse 2 confirmée";
    }
    
    test.passed = test.details.length > 0;
    results.tests.push(test);
    
    console.log("\n");
  }
  
  // ==========================================
  // SYNTHÈSE FINALE
  // ==========================================
  
  function generateSynthesis() {
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║  📊 SYNTHÈSE DU DIAGNOSTIC                                    ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");
    
    const totalTests = results.tests.length;
    const passedTests = results.tests.filter(t => t.passed).length;
    
    console.log(`Tests exécutés: ${totalTests}`);
    console.log(`Tests réussis: ${passedTests}`);
    console.log(`Tests échoués: ${totalTests - passedTests}\n`);
    
    // Récupérer diagnostics
    const diagnoses = results.tests
      .filter(t => t.diagnosis)
      .map(t => ({ test: t.name, diagnosis: t.diagnosis }));
    
    if (diagnoses.length > 0) {
      console.log("🔍 Problèmes Détectés:\n");
      diagnoses.forEach((d, i) => {
        console.log(`${i + 1}. ${d.test}:`);
        console.log(`   ${d.diagnosis}\n`);
      });
    }
    
    // Recommandations
    console.log("💡 Recommandations:\n");
    
    const test1 = results.tests.find(t => t.id === 'test1');
    if (test1 && test1.diagnosis) {
      console.log("✅ PRIORITÉ 1: Implémenter SessionId stable");
      console.log("   → Voir doc: 16_DIAGNOSTIC_TABLES_NON_PERSISTANTES.md - Solution 1\n");
    }
    
    const test3 = results.tests.find(t => t.id === 'test3');
    if (test3 && test3.diagnosis) {
      console.log("✅ PRIORITÉ 2: Normaliser keywords (supprimer accents)");
      console.log("   → Voir doc: 16_DIAGNOSTIC_TABLES_NON_PERSISTANTES.md - Solution 2\n");
    }
    
    const test2 = results.tests.find(t => t.id === 'test2');
    if (test2 && test2.details.some(d => d.check === 'lastRestoreTime' && d.value === 0)) {
      console.log("✅ PRIORITÉ 3: Implémenter auto-restauration au chargement");
      console.log("   → Voir doc: 16_DIAGNOSTIC_TABLES_NON_PERSISTANTES.md - Solution 4\n");
    }
    
    // Export JSON
    console.log("\n📄 Rapport JSON généré:");
    console.log("   Utilisez: copy(diagnosticResults) pour copier le rapport complet\n");
    
    window.diagnosticResults = results;
  }
  
  // ==========================================
  // EXÉCUTION
  // ==========================================
  
  function runAllTests() {
    test1_VerifySessionId();
    test2_VerifyRestoration();
    
    // Attendre un peu pour les logs asynchrones du test 2
    setTimeout(() => {
      test3_CompareKeywords();
      test4_TraceTableConso();
      test5_TraceTableLegend();
      
      setTimeout(() => {
        generateSynthesis();
        
        console.log("╔════════════════════════════════════════════════════════════════╗");
        console.log("║  ✅ DIAGNOSTIC TERMINÉ                                        ║");
        console.log("╚════════════════════════════════════════════════════════════════╝\n");
        
        console.log("Commandes disponibles:");
        console.log("  • copy(diagnosticResults) → Copier rapport JSON");
        console.log("  • runDiagnosticTablesNonPersistantes() → Relancer diagnostic\n");
      }, 500);
    }, 1500);
  }
  
  // Exposer globalement
  window.runDiagnosticTablesNonPersistantes = runAllTests;
  window.diagnosticResults = results;
  
  // Lancer automatiquement
  runAllTests();
  
})();
