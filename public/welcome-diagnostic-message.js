/**
 * 🎯 WELCOME DIAGNOSTIC MESSAGE
 * Affiche message automatique au chargement pour guider l'utilisateur
 * Date: 6 Octobre 2026 - 00h05
 */

(function() {
  'use strict';
  
  // Attendre que tout soit chargé
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🔬 DIAGNOSTIC SESSIONID ACTIVÉ                             ║
║                                                               ║
║   Objectif: Identifier pourquoi sessionId change             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

📋 INSTRUCTIONS RAPIDES:

1️⃣  Créer des tables avec Clara
    Exemple: "Crée une table de travaux et totalise-la"

2️⃣  Dans cette console, taper:
    window.getSessionIdTraces()

3️⃣  Regarder cette ligne:
    ❌ SessionIds ANCIENS: X

4️⃣  Interpréter:
    Si X = 0 → ✅ Solution fonctionne!
    Si X > 0 → ❌ Problème confirmé (Clara crée UUID)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 GUIDES DISPONIBLES:
   → 00_START_HERE.md (2 min - ultra-rapide)
   → 00_DIAGNOSTIC_VISUEL.md (schémas)
   → 00_README_DIAGNOSTIC_SESSIONID.md (complet)

🔧 OUTILS DISPONIBLES:
   → window.getSessionIdTraces()       (Trace sessionId)
   → window.diagnosticTableConso()     (Analyse Table_Conso)
   → window.runFullDiagnostic()        (Vue d'ensemble)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 LA COMMANDE MAGIQUE:
      `);
      
      console.log('%c window.getSessionIdTraces() ', 
        'background: #667eea; color: white; font-size: 16px; font-weight: bold; padding: 10px; border-radius: 5px;'
      );
      
      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Système chargé et prêt pour diagnostic
   Date: ${new Date().toLocaleString('fr-FR')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
      
      // Vérifier que les outils sont bien chargés
      const toolsStatus = {
        stableSessionManager: !!window.stableSessionManager,
        getSessionIdTraces: typeof window.getSessionIdTraces === 'function',
        diagnosticTableConso: typeof window.diagnosticTableConso === 'function',
        runFullDiagnostic: typeof window.runFullDiagnostic === 'function'
      };
      
      const allLoaded = Object.values(toolsStatus).every(v => v);
      
      if (allLoaded) {
        console.log('✅ Tous les outils diagnostics sont chargés');
      } else {
        console.warn('⚠️ Certains outils manquent:');
        Object.entries(toolsStatus).forEach(([name, loaded]) => {
          if (!loaded) {
            console.warn(`  ❌ ${name}`);
          }
        });
      }
      
    }, 1000);
  });
  
})();
