/**
 * 🔬 DIAGNOSTIC SESSIONID TRACER
 * Trace TOUS les appels de sessionId pour identifier le problème
 * Date: 6 Octobre 2026 - 23h15
 */

(function() {
  'use strict';
  
  console.log("🔬 ========================================");
  console.log("🔬 DIAGNOSTIC SESSIONID TRACER - START");
  console.log("🔬 ========================================");
  
  const traces = [];
  let traceId = 0;
  
  function addTrace(source, sessionId, stackTrace) {
    const trace = {
      id: ++traceId,
      timestamp: new Date().toISOString(),
      source,
      sessionId,
      stackTrace: stackTrace || new Error().stack.split('\n').slice(2, 5).join('\n')
    };
    traces.push(trace);
    
    console.log(`🔬 [Trace #${traceId}] ${source}`);
    console.log(`   SessionId: ${sessionId}`);
  }
  
  // Attendre stableSessionManager
  const checkStableManager = setInterval(() => {
    if (window.stableSessionManager) {
      clearInterval(checkStableManager);
      console.log("✅ stableSessionManager détecté");
      
      const originalGet = window.stableSessionManager.getSessionId.bind(window.stableSessionManager);
      window.stableSessionManager.getSessionId = function() {
        const result = originalGet();
        addTrace('stableSessionManager.getSessionId()', result);
        return result;
      };
      
      const originalSet = window.stableSessionManager.setSessionId.bind(window.stableSessionManager);
      window.stableSessionManager.setSessionId = function(newId) {
        addTrace('stableSessionManager.setSessionId()', newId);
        return originalSet(newId);
      };
    }
  }, 100);

  
  // Tracer window.currentSessionId
  setTimeout(() => {
    let currentValue = window.currentSessionId || null;
    addTrace('window.currentSessionId (initial)', currentValue);
    
    Object.defineProperty(window, 'currentSessionId', {
      get() {
        addTrace('window.currentSessionId [GET]', currentValue);
        return currentValue;
      },
      set(newValue) {
        addTrace('window.currentSessionId [SET]', newValue);
        currentValue = newValue;
      },
      configurable: true
    });
  }, 500);
  
  // Tracer localStorage
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    if (key === 'claraverse_stable_session_id') {
      addTrace('localStorage.setItem(claraverse_stable_session_id)', value);
    }
    return originalSetItem.call(this, key, value);
  };
  
  // Fonction rapport
  window.getSessionIdTraces = function() {
    console.log("📊 ========================================");
    console.log(`📊 RAPPORT SESSIONID - ${traces.length} événements`);
    console.log("📊 ========================================");
    
    traces.forEach(t => {
      console.log(`\n🔬 Trace #${t.id} - ${t.timestamp}`);
      console.log(`   Source: ${t.source}`);
      console.log(`   SessionId: ${t.sessionId}`);
    });

    
    // Analyse
    const uniqueSessions = [...new Set(traces.map(t => t.sessionId).filter(Boolean))];
    console.log(`\n📈 ANALYSE:`);
    console.log(`   Total traces: ${traces.length}`);
    console.log(`   SessionIds uniques: ${uniqueSessions.length}`);
    uniqueSessions.forEach((sid, idx) => {
      const count = traces.filter(t => t.sessionId === sid).length;
      console.log(`   ${idx + 1}. ${sid} (${count} utilisations)`);
    });
    
    // Format ancien vs stable
    const oldFormat = uniqueSessions.filter(s => s && s.includes('-') && !s.startsWith('stable_'));
    const stableFormat = uniqueSessions.filter(s => s && s.startsWith('stable_session_'));
    
    console.log(`\n🔍 DIAGNOSTIC:`);
    console.log(`   ✅ SessionIds STABLES: ${stableFormat.length}`);
    console.log(`   ❌ SessionIds ANCIENS: ${oldFormat.length}`);
    
    if (oldFormat.length > 0) {
      console.log(`\n🚨 PROBLÈME DÉTECTÉ:`);
      console.log(`   Des sessionIds ANCIENS (UUID) sont encore utilisés !`);
      console.log(`   Cela signifie que stable-session-manager n'est PAS actif partout.`);
    }
    
    return {
      traces,
      uniqueSessions,
      stableFormat,
      oldFormat,
      analysis: {
        totalTraces: traces.length,
        uniqueSessionCount: uniqueSessions.length,
        stableCount: stableFormat.length,
        oldCount: oldFormat.length,
        isStable: oldFormat.length === 0
      }
    };
  };
  
  console.log("✅ Tracer installé - Utilisez window.getSessionIdTraces() pour rapport");
  
})();
