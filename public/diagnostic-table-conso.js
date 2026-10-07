/**
 * 🔬 DIAGNOSTIC TABLE_CONSOLIDATION
 * Pourquoi Table_Consolidation ne persiste JAMAIS alors que Resultat OUI ?
 * Date: 6 Octobre 2026 - 23h20
 */

(function() {
  'use strict';
  
  console.log("🔬 ==========================================");
  console.log("🔬 DIAGNOSTIC TABLE_CONSOLIDATION");
  console.log("🔬 ==========================================");
  
  // Fonction de diagnostic
  window.diagnosticTableConso = function() {
    const report = {
      timestamp: new Date().toISOString(),
      tests: []
    };
    
    console.log("\n📊 ANALYSE TABLE_CONSOLIDATION...\n");
    
    // ========================================
    // TEST 1: Recherche Table_Consolidation dans le DOM
    // ========================================
    const test1 = {
      id: "dom-search",
      name: "Recherche Table_Consolidation dans DOM",
      checks: []
    };
    
    // Recherche par keyword exact
    const tablesWithKeyword = document.querySelectorAll('table[data-table-keyword*="Table_Consolidation"]');
    test1.checks.push({
      check: "keyword-exact",
      count: tablesWithKeyword.length,
      found: tablesWithKeyword.length > 0
    });

    
    // Recherche par keyword partiel
    const allTables = document.querySelectorAll('table[data-table-keyword]');
    const consoTables = Array.from(allTables).filter(t => {
      const kw = t.getAttribute('data-table-keyword');
      return kw && (kw.includes('conso') || kw.includes('Conso') || kw.includes('Consolidation'));
    });
    test1.checks.push({
      check: "keyword-partiel",
      count: consoTables.length,
      keywords: consoTables.map(t => t.getAttribute('data-table-keyword'))
    });
    
    // Recherche Table_conso
    const tableConso = document.querySelectorAll('table[data-table-keyword*="Table_conso"]');
    test1.checks.push({
      check: "Table_conso",
      count: tableConso.length,
      found: tableConso.length > 0
    });
    
    // Recherche par texte "Consolidation"
    const allTablesArray = Array.from(document.querySelectorAll('table'));
    const consoByText = allTablesArray.filter(t => {
      const text = t.textContent || '';
      return text.toLowerCase().includes('consolidation');
    });
    test1.checks.push({
      check: "texte-consolidation",
      count: consoByText.length,
      found: consoByText.length > 0
    });
    
    test1.passed = consoTables.length > 0 || tableConso.length > 0;
    report.tests.push(test1);

    
    // ========================================
    // TEST 2: Vérification dans DOM Storage
    // ========================================
    const test2 = {
      id: "dom-storage",
      name: "Recherche dans DOM Storage Container",
      checks: []
    };
    
    const storage = document.getElementById('claraverse-dom-storage');
    if (storage) {
      const storedTables = storage.querySelectorAll('table');
      const storedConso = Array.from(storedTables).filter(t => {
        const kw = t.getAttribute('data-table-keyword');
        return kw && (kw.includes('Consolidation') || kw.includes('conso'));
      });
      
      test2.checks.push({
        check: "storage-exists",
        found: true,
        totalTables: storedTables.length,
        consoTables: storedConso.length,
        consoKeywords: storedConso.map(t => t.getAttribute('data-table-keyword'))
      });
    } else {
      test2.checks.push({
        check: "storage-exists",
        found: false,
        error: "DOM Storage container not found"
      });
    }
    
    test2.passed = test2.checks.some(c => c.consoTables > 0);
    report.tests.push(test2);

    
    // ========================================
    // TEST 3: Vérification Script conso.js
    // ========================================
    const test3 = {
      id: "conso-script",
      name: "Vérification Script conso.js",
      checks: []
    };
    
    // Vérifier si conso.js est chargé
    const scripts = Array.from(document.querySelectorAll('script'));
    const consoScript = scripts.find(s => s.src && s.src.includes('conso.js'));
    
    test3.checks.push({
      check: "script-loaded",
      found: !!consoScript,
      src: consoScript ? consoScript.src : null
    });
    
    // Vérifier variables globales conso
    test3.checks.push({
      check: "window.totaliserTables",
      exists: typeof window.totaliserTables === 'function'
    });
    
    test3.checks.push({
      check: "window.calculerConsolidation",
      exists: typeof window.calculerConsolidation === 'function'
    });
    
    test3.passed = test3.checks.every(c => c.found !== false && c.exists !== false);
    report.tests.push(test3);

    
    // ========================================
    // TEST 4: Recherche Table Resultat (qui fonctionne)
    // ========================================
    const test4 = {
      id: "table-resultat",
      name: "Comparaison avec Table Resultat (qui persiste)",
      checks: []
    };
    
    const resultatTables = document.querySelectorAll('table[data-table-keyword*="Resultat"]');
    test4.checks.push({
      check: "resultat-dom",
      count: resultatTables.length,
      keywords: Array.from(resultatTables).map(t => t.getAttribute('data-table-keyword'))
    });
    
    if (storage) {
      const storedResultat = storage.querySelectorAll('table[data-table-keyword*="Resultat"]');
      test4.checks.push({
        check: "resultat-storage",
        count: storedResultat.length,
        keywords: Array.from(storedResultat).map(t => t.getAttribute('data-table-keyword'))
      });
    }
    
    test4.passed = true;
    report.tests.push(test4);
    
    // ========================================
    // TEST 5: Listener de sauvegarde
    // ========================================
    const test5 = {
      id: "save-listeners",
      name: "Vérification Listeners de Sauvegarde",
      checks: []
    };
    
    // Vérifier si domAutoSave est actif
    test5.checks.push({
      check: "domAutoSave",
      loaded: !!window.domAutoSave
    });

    
    // Vérifier listeners sur tables conso
    if (consoTables.length > 0) {
      consoTables.forEach((table, idx) => {
        const hasListeners = table._hasAutoSaveListeners || false;
        test5.checks.push({
          check: `conso-table-${idx}`,
          keyword: table.getAttribute('data-table-keyword'),
          hasListeners
        });
      });
    }
    
    test5.passed = test5.checks.some(c => c.loaded === true || c.hasListeners === true);
    report.tests.push(test5);
    
    // ========================================
    // RAPPORT FINAL
    // ========================================
    console.log("\n📋 RAPPORT:\n");
    report.tests.forEach(test => {
      console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
      test.checks.forEach(check => {
        console.log(`   ${JSON.stringify(check)}`);
      });
      console.log("");
    });
    
    // CONCLUSION
    console.log("\n🎯 CONCLUSION:");
    const domFound = test1.passed;
    const storageFound = test2.passed;
    const resultatFound = test4.checks.some(c => c.count > 0);
    
    if (!domFound && !storageFound) {
      console.log("❌ Table_Consolidation ABSENTE du DOM et du Storage");
      console.log("   → La table n'est probablement jamais créée par Clara");
    } else if (domFound && !storageFound) {
      console.log("⚠️ Table_Consolidation PRÉSENTE dans DOM mais PAS dans Storage");
      console.log("   → Problème de SAUVEGARDE (listeners manquants ?)");
    } else if (!domFound && storageFound) {
      console.log("⚠️ Table_Consolidation dans Storage mais PAS restaurée dans DOM");
      console.log("   → Problème de RESTAURATION");
    } else {
      console.log("✅ Table_Consolidation présente partout");
    }
    
    if (resultatFound && !storageFound) {
      console.log("\n🔍 HYPOTHÈSE:");
      console.log("   Table Resultat persiste MAIS Table_Consolidation NON");
      console.log("   → Vérifier si les deux utilisent le MÊME keyword");
      console.log("   → Vérifier si les deux ont les MÊMES listeners");
    }
    
    console.log("\n🔬 ==========================================\n");
    
    return report;
  };
  
  console.log("✅ Diagnostic Table_Consolidation chargé");
  console.log("   Utilisez: window.diagnosticTableConso()");
  
})();
