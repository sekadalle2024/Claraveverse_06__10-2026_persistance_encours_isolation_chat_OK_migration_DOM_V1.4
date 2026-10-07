/**
 * 🔧 FIX UUID BLOCK - Solution Hypothèse 4.1
 * Bloque la création de UUID et force l'utilisation du sessionId stable
 * Date: 7 Octobre 2026 - 00h30
 */

(function() {
  'use strict';
  
  console.log("🔧 [Fix UUID Block] Initialisation...");
  
  // ============================================
  // SOLUTION 1A: Bloquer crypto.randomUUID()
  // ============================================
  
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    const originalRandomUUID = crypto.randomUUID.bind(crypto);
    
    crypto.randomUUID = function() {
      const uuid = originalRandomUUID();
      
      console.warn("🚫 [UUID Bloqué] crypto.randomUUID() appelé");
      console.warn("   UUID généré:", uuid);
      console.warn("   → Remplacé par sessionId stable");
      console.trace("   Stack:");
      
      // Retourner sessionId stable au lieu de UUID
      if (window.stableSessionManager) {
        const stableId = window.stableSessionManager.getSessionId();
        console.log("   ✅ Utilise stable:", stableId);
        return stableId;
      } else if (window.currentSessionId) {
        console.log("   ✅ Utilise currentSessionId:", window.currentSessionId);
        return window.currentSessionId;
      } else {
        console.warn("   ⚠️ Aucun sessionId stable disponible, utilise UUID");
        return uuid;
      }
    };
    
    console.log("✅ [Fix UUID] crypto.randomUUID() intercepté");
  }
  
  // ============================================
  // SOLUTION 1B: Bloquer crypto.getRandomValues (méthode alternative)
  // ============================================
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const originalGetRandomValues = crypto.getRandomValues.bind(crypto);
    
    crypto.getRandomValues = function(array) {
      // Vérifier si utilisé pour générer UUID (16 bytes = UUID)
      if (array && array.length === 16) {
        console.warn("🚫 [UUID Bloqué] crypto.getRandomValues(16) - probablement pour UUID");
        console.trace("   Stack:");
      }
      return originalGetRandomValues(array);
    };
    
    console.log("✅ [Fix UUID] crypto.getRandomValues() monitoré");
  }
  
  // ============================================
  // SOLUTION 2: Empêcher écrasement window.currentSessionId
  // ============================================
  
  setTimeout(() => {
    if (window.stableSessionManager) {
      const stableId = window.stableSessionManager.getSessionId();
      
      // Geler le setter pour empêcher écrasement
      let lockedValue = stableId;
      
      Object.defineProperty(window, 'currentSessionId', {
        get() {
          return lockedValue;
        },
        set(newValue) {
          // Vérifier si c'est un UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newValue);
          
          if (isUUID) {
            console.warn("🚫 [UUID Bloqué] Tentative écrasement currentSessionId");
            console.warn("   Ancien:", lockedValue);
            console.warn("   Nouveau (UUID):", newValue);
            console.warn("   → BLOQUÉ, conserve sessionId stable");
            console.trace("   Stack:");
            
            // NE PAS écraser, conserver le stable
            return;
          } else {
            // Si c'est un stable sessionId, autoriser
            console.log("✅ [Fix UUID] currentSessionId mis à jour:", newValue);
            lockedValue = newValue;
          }
        },
        configurable: false  // Empêcher redéfinition
      });
      
      console.log("✅ [Fix UUID] window.currentSessionId verrouillé:", stableId);
    }
  }, 500);
  
  // ============================================
  // SOLUTION 3: Wrapper Math.random() pour sessionId
  // ============================================
  
  // Certaines implémentations utilisent Math.random() pour générer sessionId
  // On ne peut pas bloquer complètement Math.random() (utilisé partout)
  // Mais on peut logger les appels suspects
  
  const originalMathRandom = Math.random.bind(Math);
  let randomCallCount = 0;
  
  Math.random = function() {
    randomCallCount++;
    
    // Logger seulement les premiers appels (pour debug)
    if (randomCallCount <= 10) {
      const stack = new Error().stack;
      if (stack && stack.includes('sessionId')) {
        console.warn("⚠️ [Math.random] Appelé dans contexte sessionId");
        console.trace("Stack:");
      }
    }
    
    return originalMathRandom();
  };
  
  console.log("✅ [Fix UUID] Math.random() monitoré");
  
  // ============================================
  // FONCTION DE VÉRIFICATION
  // ============================================
  
  window.verifyUUIDFix = function() {
    console.log("🔍 ═══════════════════════════════════════");
    console.log("🔍 VÉRIFICATION FIX UUID");
    console.log("🔍 ═══════════════════════════════════════");
    
    // Test 1: crypto.randomUUID()
    console.log("\n📊 Test 1: crypto.randomUUID()");
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      const testUUID = crypto.randomUUID();
      const isStable = testUUID.startsWith('stable_session_');
      console.log("   Résultat:", testUUID);
      console.log("   Format:", isStable ? "✅ Stable" : "❌ UUID");
    } else {
      console.log("   ⚠️ crypto.randomUUID non disponible");
    }
    
    // Test 2: window.currentSessionId
    console.log("\n📊 Test 2: window.currentSessionId");
    console.log("   Valeur actuelle:", window.currentSessionId);
    console.log("   Format:", window.currentSessionId?.startsWith('stable_session_') ? "✅ Stable" : "❌ UUID ou absent");
    
    // Test 3: Tentative écrasement
    console.log("\n📊 Test 3: Tentative écrasement");
    const beforeValue = window.currentSessionId;
    window.currentSessionId = "test-uuid-12345678-1234-1234-1234-123456789012";
    const afterValue = window.currentSessionId;
    
    if (beforeValue === afterValue) {
      console.log("   ✅ Écrasement BLOQUÉ (comme attendu)");
    } else {
      console.log("   ❌ Écrasement AUTORISÉ (problème!)");
    }
    
    // Test 4: Tracer sessionId
    console.log("\n📊 Test 4: Tracer SessionId");
    if (typeof window.getSessionIdTraces === 'function') {
      const traces = window.getSessionIdTraces();
      console.log("   SessionIds STABLES:", traces.analysis.stableCount);
      console.log("   SessionIds ANCIENS:", traces.analysis.oldCount);
      
      if (traces.analysis.oldCount === 0) {
        console.log("   ✅ Aucun UUID détecté");
      } else {
        console.log("   ❌ UUID encore présents");
      }
    } else {
      console.log("   ⚠️ getSessionIdTraces non disponible");
    }
    
    console.log("\n🔍 ═══════════════════════════════════════\n");
    
    return {
      cryptoFixed: typeof crypto !== 'undefined' && crypto.randomUUID().startsWith('stable_'),
      currentSessionIdLocked: beforeValue === afterValue,
      noUUIDs: typeof window.getSessionIdTraces === 'function' ? window.getSessionIdTraces().analysis.oldCount === 0 : null
    };
  };
  
  console.log("✅ [Fix UUID] Système complet chargé");
  console.log("   Utilisez: window.verifyUUIDFix() pour vérifier");
  
})();
