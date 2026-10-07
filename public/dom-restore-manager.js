/**
 * DOM Restore Manager
 * Gestionnaire de restauration basé sur DOM Storage
 * Migration IndexedDB → DOM Storage
 * Date: 12 Septembre 2026
 */

class DOMRestoreManager {
  constructor() {
    this.isRestoring = false;
    this.lastRestoreTime = 0;
    this.MIN_RESTORE_INTERVAL = 5000;
  }

  /**
   * Obtenir sessionId stable (Solution Hypothèse 1.1 + Fix UUID)
   */
  getStableSessionId() {
    // Fonction helper: détecter si c'est un UUID
    const isUUID = (str) => {
      if (!str) return false;
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    };
    
    // 1. Utiliser stableSessionManager si disponible
    if (window.stableSessionManager) {
      const stableId = window.stableSessionManager.getSessionId();
      if (stableId && !isUUID(stableId)) {
        return stableId;
      }
    }
    
    // 2. Vérifier currentSessionId (mais bloquer si UUID)
    if (window.currentSessionId && !isUUID(window.currentSessionId)) {
      return window.currentSessionId;
    }
    
    // Si currentSessionId est UUID, le bloquer
    if (window.currentSessionId && isUUID(window.currentSessionId)) {
      console.warn(`🚫 [DOM Restore] currentSessionId est UUID: ${window.currentSessionId}`);
      console.warn(`   → Recherche sessionId stable alternatif`);
    }
    
    // 3. Fallback: localStorage (mais bloquer si UUID)
    const lsSessionId = localStorage.getItem('claraverse_stable_session_id');
    if (lsSessionId && !isUUID(lsSessionId)) {
      return lsSessionId;
    }
    
    // 4. Erreur si aucun sessionId stable trouvé
    console.error('❌ [DOM Restore] Aucun sessionId STABLE trouvé');
    console.error('   Tous les sessionIds disponibles sont des UUID ou inexistants');
    return null;
  }

  /**
   * Restaurer toutes les tables d'une session
   */
  async restoreSessionTables(sessionId) {
    if (this.isRestoring) {
      console.log('⏳ [DOM Restore] Restauration déjà en cours...');
      return;
    }

    const now = Date.now();
    if (now - this.lastRestoreTime < this.MIN_RESTORE_INTERVAL) {
      console.log('⏳ [DOM Restore] Intervalle minimum non atteint');
      return;
    }

    this.isRestoring = true;
    this.lastRestoreTime = now;

    // ✅ SOLUTION HYPOTHÈSE 1.1 : Utiliser sessionId STABLE
    const stableSessionId = this.getStableSessionId();
    if (!stableSessionId) {
      console.error('❌ [DOM Restore] SessionId introuvable, restauration annulée');
      this.isRestoring = false;
      return;
    }

    console.log(`🔄 [DOM Restore] Début restauration session: ${stableSessionId}`);
    if (sessionId && sessionId !== stableSessionId) {
      console.log(`🔄 [DOM Restore] SessionId normalisé: ${sessionId} → ${stableSessionId}`);
    }

    try {
      // Récupérer tables depuis DOM Storage avec sessionId stable
      const tables = window.domStorageManager.restoreAllTables(stableSessionId);
      
      console.log(`📋 [DOM Restore] ${tables.length} table(s) à restaurer`);

      for (const tableData of tables) {
        await this.restoreTableToUI(tableData);
      }

      console.log('✅ [DOM Restore] Restauration terminée');
      
      // Émettre événement de succès
      document.dispatchEvent(new CustomEvent('claraverse:restore:complete', {
        detail: { sessionId: stableSessionId, tableCount: tables.length }
      }));

    } catch (error) {
      console.error('❌ [DOM Restore] Erreur restauration:', error);
    } finally {
      this.isRestoring = false;
    }
  }

  /**
   * Restaurer une table dans l'UI
   */
  async restoreTableToUI(tableData) {
    const { keyword, tableId, element } = tableData;

    try {
      // Chercher table existante dans UI (zone visible)
      const existingTable = this.findTableInUI(keyword);

      if (existingTable) {
        // Mettre à jour contenu
        existingTable.innerHTML = element.innerHTML;
        
        // Copier attributs
        Array.from(element.attributes).forEach(attr => {
          existingTable.setAttribute(attr.name, attr.value);
        });
        
        existingTable.setAttribute('data-restored', 'true');
        existingTable.setAttribute('data-restored-at', new Date().toISOString());
        
        console.log(`🔄 [DOM Restore] Table UI mise à jour: ${keyword}`);
      } else {
        // Insérer nouvelle table dans body (zone visible sous chat)
        const restoredTable = element.cloneNode(true);
        restoredTable.setAttribute('data-restored', 'true');
        restoredTable.setAttribute('data-restored-at', new Date().toISOString());
        
        // Créer wrapper pour meilleure organisation
        const wrapper = document.createElement('div');
        wrapper.className = 'restored-table-wrapper';
        wrapper.setAttribute('data-keyword', keyword);
        wrapper.style.cssText = 'margin: 20px; padding: 15px; border: 2px solid #4CAF50; border-radius: 8px; background: #f9f9f9;';
        
        // Ajouter badge "Restauré"
        const badge = document.createElement('div');
        badge.style.cssText = 'display: inline-block; background: #4CAF50; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; margin-bottom: 10px;';
        badge.textContent = '✅ Table Restaurée';
        
        // Ajouter titre
        const title = document.createElement('h3');
        title.textContent = keyword;
        title.style.cssText = 'margin: 10px 0; color: #333; font-size: 18px;';
        
        wrapper.appendChild(badge);
        wrapper.appendChild(title);
        wrapper.appendChild(restoredTable);
        
        // Insérer dans body (sous zone de saisie)
        document.body.appendChild(wrapper);
        
        console.log(`✅ [DOM Restore] Table UI créée: ${keyword}`);
      }

    } catch (error) {
      console.error(`❌ [DOM Restore] Erreur restauration UI ${keyword}:`, error);
    }
  }

  /**
   * Chercher une table dans l'UI (zone visible)
   */
  findTableInUI(keyword) {
    // Exclure les tables dans le conteneur de stockage caché
    const visibleTables = Array.from(document.querySelectorAll('table[data-keyword]'))
      .filter(table => !table.closest('#claraverse-dom-storage'));
    
    return visibleTables.find(table => table.dataset.keyword === keyword) || null;
  }

  /**
   * Forcer restauration immédiate
   */
  forceRestore(sessionId) {
    this.lastRestoreTime = 0;
    return this.restoreSessionTables(sessionId);
  }

  /**
   * Nettoyer les tables restaurées de l'UI
   */
  clearRestoredTablesFromUI() {
    const wrappers = document.querySelectorAll('.restored-table-wrapper');
    wrappers.forEach(wrapper => wrapper.remove());
    
    const restoredTables = document.querySelectorAll('table[data-restored="true"]');
    restoredTables.forEach(table => {
      if (!table.closest('#claraverse-dom-storage')) {
        table.removeAttribute('data-restored');
        table.removeAttribute('data-restored-at');
      }
    });
    
    console.log(`🧹 [DOM Restore] ${wrappers.length} wrapper(s) nettoyé(s)`);
  }
}

// Export singleton
window.domRestoreManager = new DOMRestoreManager();

console.log('✅ [DOM Restore Manager] Chargé et initialisé');

// ✅ SOLUTION HYPOTHÈSE 1.1 : AUTO-RESTAURATION AU CHARGEMENT
// Attendre que stableSessionManager soit chargé, puis restaurer automatiquement
window.addEventListener('DOMContentLoaded', () => {
  console.log('🔄 [DOM Restore] DOMContentLoaded détecté');
  
  // Attendre 2 secondes pour laisser le temps au DOM de se stabiliser
  setTimeout(() => {
    console.log('🔄 [DOM Restore] Démarrage auto-restauration...');
    
    // Obtenir sessionId stable
    const sessionId = window.stableSessionManager 
      ? window.stableSessionManager.getSessionId()
      : (window.currentSessionId || localStorage.getItem('claraverse_stable_session_id'));
    
    if (sessionId) {
      console.log(`🔄 [DOM Restore] SessionId détecté: ${sessionId}`);
      window.domRestoreManager.forceRestore(sessionId);
    } else {
      console.warn('⚠️ [DOM Restore] Aucun sessionId, restauration ignorée');
    }
  }, 2000);
});

// Écouter changement de session pour restaurer automatiquement
document.addEventListener('claraverse:session:changed', (e) => {
  console.log('🔄 [DOM Restore] Changement de session détecté');
  if (e.detail && e.detail.sessionId) {
    setTimeout(() => {
      window.domRestoreManager.forceRestore(e.detail.sessionId);
    }, 500);
  }
});
