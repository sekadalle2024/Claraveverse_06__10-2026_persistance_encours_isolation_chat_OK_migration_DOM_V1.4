/**
 * 🔐 STABLE SESSION MANAGER
 * Gère un sessionId STABLE qui persiste entre les rechargements de page
 * Solution à l'Hypothèse 1.1 : SessionId change entre sauvegarde et restauration
 * Date: 6 Octobre 2026
 */

(function() {
  'use strict';
  
  console.log("🔐 [Stable Session Manager] Initialisation...");
  
  /**
   * Stratégie de détermination du sessionId STABLE
   * 
   * Priorité (du plus spécifique au plus général) :
   * 1. URL Query Parameter (?sessionId=xxx) - Pour liens directs vers un chat
   * 2. Chat ID dans DOM (data-chat-id) - Pour session chat actuelle
   * 3. LocalStorage stable - Pour continuité entre rechargements
   * 4. Création nouveau ID stable - Si rien n'existe
   */
  
  class StableSessionManager {
    constructor() {
      this.STORAGE_KEY = 'claraverse_stable_session_id';
      this.currentSessionId = null;
      this.sessionStartTime = Date.now();
      
      // Initialiser au chargement
      this.initialize();
    }
    
    /**
     * Initialiser et déterminer le sessionId stable
     */
    initialize() {
      console.log("🔍 [Stable Session] Détermination sessionId...");
      
      // 1. Vérifier URL
      const urlSessionId = this.getSessionIdFromURL();
      if (urlSessionId) {
        this.currentSessionId = urlSessionId;
        this.saveToLocalStorage(urlSessionId);
        console.log(`✅ [Stable Session] SessionId depuis URL: ${urlSessionId}`);
        return;
      }
      
      // 2. Vérifier Chat ID dans DOM (attendre que React monte)
      const checkDOMInterval = setInterval(() => {
        const chatSessionId = this.getSessionIdFromDOM();
        if (chatSessionId) {
          clearInterval(checkDOMInterval);
          this.currentSessionId = chatSessionId;
          this.saveToLocalStorage(chatSessionId);
          console.log(`✅ [Stable Session] SessionId depuis DOM: ${chatSessionId}`);
          this.notifySessionChange(chatSessionId);
        }
      }, 500);
      
      // Timeout après 10 secondes
      setTimeout(() => {
        clearInterval(checkDOMInterval);
        if (!this.currentSessionId) {
          this.fallbackToLocalStorageOrCreate();
        }
      }, 10000);
      
      // 3. En attendant, utiliser localStorage ou créer
      this.fallbackToLocalStorageOrCreate();
    }
    
    /**
     * Fallback: LocalStorage ou création nouveau
     */
    fallbackToLocalStorageOrCreate() {
      // Essayer localStorage
      const storedSessionId = localStorage.getItem(this.STORAGE_KEY);
      if (storedSessionId) {
        this.currentSessionId = storedSessionId;
        console.log(`✅ [Stable Session] SessionId depuis localStorage: ${storedSessionId}`);
        return;
      }
      
      // Créer nouveau ID stable
      const newSessionId = this.createStableSessionId();
      this.currentSessionId = newSessionId;
      this.saveToLocalStorage(newSessionId);
      console.log(`✅ [Stable Session] Nouveau sessionId créé: ${newSessionId}`);
    }
    
    /**
     * Récupérer sessionId depuis URL (?sessionId=xxx)
     */
    getSessionIdFromURL() {
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get('sessionId') || null;
      } catch (error) {
        console.warn("⚠️ [Stable Session] Erreur lecture URL:", error);
        return null;
      }
    }
    
    /**
     * Récupérer sessionId depuis DOM (chat actuel)
     */
    getSessionIdFromDOM() {
      try {
        // Stratégie 1: data-session-id sur élément chat
        const chatElement = document.querySelector('[data-session-id]');
        if (chatElement && chatElement.dataset.sessionId) {
          return chatElement.dataset.sessionId;
        }
        
        // Stratégie 2: data-chat-id (Flowise style)
        const chatContainer = document.querySelector('[data-chat-id]');
        if (chatContainer && chatContainer.dataset.chatId) {
          return chatContainer.dataset.chatId;
        }
        
        // Stratégie 3: Dernier message utilisateur avec sessionId
        const userMessages = document.querySelectorAll('.message-bubble.user[data-session-id]');
        if (userMessages.length > 0) {
          const lastMessage = userMessages[userMessages.length - 1];
          return lastMessage.dataset.sessionId;
        }
        
        return null;
      } catch (error) {
        console.warn("⚠️ [Stable Session] Erreur lecture DOM:", error);
        return null;
      }
    }
    
    /**
     * Créer un nouveau sessionId stable
     */
    createStableSessionId() {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 12);
      return `stable_session_${timestamp}_${random}`;
    }
    
    /**
     * Sauvegarder dans localStorage
     */
    saveToLocalStorage(sessionId) {
      try {
        localStorage.setItem(this.STORAGE_KEY, sessionId);
        localStorage.setItem(`${this.STORAGE_KEY}_updated_at`, new Date().toISOString());
        console.log(`💾 [Stable Session] Sauvegardé dans localStorage: ${sessionId}`);
      } catch (error) {
        console.error("❌ [Stable Session] Erreur sauvegarde localStorage:", error);
      }
    }
    
    /**
     * Obtenir le sessionId stable actuel
     */
    getSessionId() {
      // Si pas encore initialisé, essayer de récupérer
      if (!this.currentSessionId) {
        this.currentSessionId = localStorage.getItem(this.STORAGE_KEY);
      }
      
      // Si toujours pas, créer nouveau
      if (!this.currentSessionId) {
        this.currentSessionId = this.createStableSessionId();
        this.saveToLocalStorage(this.currentSessionId);
      }
      
      return this.currentSessionId;
    }
    
    /**
     * Définir manuellement le sessionId (pour compatibilité)
     */
    setSessionId(sessionId) {
      if (!sessionId) {
        console.warn("⚠️ [Stable Session] setSessionId appelé avec valeur vide");
        return;
      }
      
      const oldSessionId = this.currentSessionId;
      this.currentSessionId = sessionId;
      this.saveToLocalStorage(sessionId);
      
      console.log(`🔄 [Stable Session] SessionId changé: ${oldSessionId} → ${sessionId}`);
      
      // Émettre événement de changement
      this.notifySessionChange(sessionId);
    }
    
    /**
     * Notifier le changement de session
     */
    notifySessionChange(sessionId) {
      try {
        const event = new CustomEvent('claraverse:session:changed', {
          detail: { 
            sessionId: sessionId,
            timestamp: Date.now()
          }
        });
        document.dispatchEvent(event);
        console.log(`📢 [Stable Session] Événement session:changed émis`);
      } catch (error) {
        console.warn("⚠️ [Stable Session] Erreur émission événement:", error);
      }
    }
    
    /**
     * Forcer nouveau sessionId (nouveau chat)
     */
    resetSession() {
      const newSessionId = this.createStableSessionId();
      this.setSessionId(newSessionId);
      console.log(`🔄 [Stable Session] Session réinitialisée: ${newSessionId}`);
      return newSessionId;
    }
    
    /**
     * Obtenir toutes les sessions disponibles dans storage
     */
    getAllStoredSessions() {
      const container = document.getElementById('claraverse-dom-storage');
      if (!container) return [];
      
      const sessions = container.querySelectorAll('[data-session-id]');
      return Array.from(sessions).map(s => ({
        sessionId: s.dataset.sessionId,
        createdAt: s.dataset.createdAt,
        tableCount: s.querySelectorAll('table').length
      }));
    }
    
    /**
     * Diagnostic : afficher informations session
     */
    diagnose() {
      console.log("═════════════════════════════════════════════════");
      console.log("🔐 DIAGNOSTIC STABLE SESSION MANAGER");
      console.log("═════════════════════════════════════════════════");
      
      console.log("\n📍 Session Actuelle:");
      console.log(`   SessionId: ${this.currentSessionId}`);
      console.log(`   Durée session: ${Math.floor((Date.now() - this.sessionStartTime) / 1000)}s`);
      
      console.log("\n📦 LocalStorage:");
      console.log(`   ${this.STORAGE_KEY}: ${localStorage.getItem(this.STORAGE_KEY)}`);
      console.log(`   Dernière MAJ: ${localStorage.getItem(`${this.STORAGE_KEY}_updated_at`)}`);
      
      console.log("\n🌐 URL:");
      console.log(`   Query sessionId: ${this.getSessionIdFromURL() || 'Aucun'}`);
      
      console.log("\n🖥️ DOM:");
      console.log(`   Chat sessionId: ${this.getSessionIdFromDOM() || 'Aucun'}`);
      
      console.log("\n💾 Sessions Stockées:");
      const storedSessions = this.getAllStoredSessions();
      if (storedSessions.length === 0) {
        console.log("   Aucune session stockée");
      } else {
        storedSessions.forEach((s, i) => {
          console.log(`   ${i + 1}. ${s.sessionId} (${s.tableCount} tables)`);
        });
      }
      
      console.log("\n═════════════════════════════════════════════════");
      
      return {
        currentSessionId: this.currentSessionId,
        storedSessions: storedSessions,
        localStorage: localStorage.getItem(this.STORAGE_KEY),
        urlSessionId: this.getSessionIdFromURL(),
        domSessionId: this.getSessionIdFromDOM()
      };
    }
  }
  
  // ==========================================
  // INITIALISATION GLOBALE
  // ==========================================
  
  window.stableSessionManager = new StableSessionManager();
  
  // Écouter événements de changement de chat
  document.addEventListener('claraverse:chat:new', (e) => {
    console.log("🆕 [Stable Session] Nouveau chat détecté");
    if (e.detail && e.detail.sessionId) {
      window.stableSessionManager.setSessionId(e.detail.sessionId);
    } else {
      window.stableSessionManager.resetSession();
    }
  });
  
  // Compatibilité avec window.currentSessionId (si utilisé ailleurs)
  Object.defineProperty(window, 'currentSessionId', {
    get: function() {
      return window.stableSessionManager.getSessionId();
    },
    set: function(value) {
      if (value) {
        window.stableSessionManager.setSessionId(value);
      }
    }
  });
  
  console.log("✅ [Stable Session Manager] Initialisé");
  console.log(`📍 SessionId actuel: ${window.stableSessionManager.getSessionId()}`);
  console.log("💡 Commande test: stableSessionManager.diagnose()");
  
})();
