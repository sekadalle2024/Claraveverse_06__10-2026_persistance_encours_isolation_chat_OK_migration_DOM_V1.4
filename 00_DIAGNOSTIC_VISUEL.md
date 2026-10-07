# 🎨 DIAGNOSTIC VISUEL - SessionId Instable

**Date:** 6 Octobre 2026 - 23h55

---

## 🔴 PROBLÈME ACTUEL

### Ce qui devrait se passer (ATTENDU)
```
┌─────────────────────────────────────────────────┐
│  AVANT F5                                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. User lance app                              │
│     └→ stable-session-manager crée:             │
│        stable_session_ABC123                    │
│                                                 │
│  2. Clara crée tables                           │
│     └→ TOUTES utilisent: stable_session_ABC123  │
│                                                 │
│  3. Tables sauvegardées                         │
│     DOM Storage:                                │
│     ┌───────────────────────────────┐          │
│     │ Session: stable_session_ABC123│          │
│     │ - Table_Consolidation        │          │
│     │ - Table_Resultat             │          │
│     │ - Modelised_table            │          │
│     └───────────────────────────────┘          │
│                                                 │
└─────────────────────────────────────────────────┘

                      ⬇️ F5

┌─────────────────────────────────────────────────┐
│  APRÈS F5                                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. Page recharge                               │
│     └→ stable-session-manager lit localStorage: │
│        stable_session_ABC123 (MÊME ID)          │
│                                                 │
│  2. Restauration auto                           │
│     └→ Cherche sessionId: stable_session_ABC123 │
│        ✅ Trouve 3 tables                       │
│        ✅ Restaure TOUT                         │
│                                                 │
└─────────────────────────────────────────────────┘

Résultat: ✅ 100% restauration, 0 doublons
```

---

### Ce qui se passe VRAIMENT (ACTUEL)
```
┌─────────────────────────────────────────────────┐
│  AVANT F5                                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. User lance app                              │
│     └→ stable-session-manager crée:             │
│        stable_session_ABC123 ✅                 │
│                                                 │
│  2. Clara démarre (React)                       │
│     └→ Clara crée SON PROPRE sessionId:         │
│        a22084a0-e8ab-47d0-9... ❌ (UUID!)      │
│        Écrase stable_session_ABC123             │
│                                                 │
│  3. User crée Table_1                           │
│     └→ Utilise: a22084a0-... (UUID Clara)      │
│                                                 │
│  4. User crée Table_2                           │
│     └→ Clara recrée NOUVEAU UUID:               │
│        39e3da91-c410-4776-9... ❌ (UUID2!)     │
│                                                 │
│  5. Tables sauvegardées                         │
│     DOM Storage:                                │
│     ┌───────────────────────────────┐          │
│     │ Session: stable_session_ABC123│          │
│     │ - (vide)                      │          │
│     ├───────────────────────────────┤          │
│     │ Session: a22084a0-e8ab-47d... │ ❌      │
│     │ - Table_Consolidation         │          │
│     ├───────────────────────────────┤          │
│     │ Session: 39e3da91-c410-47...  │ ❌      │
│     │ - Table_Resultat              │          │
│     │ - Modelised_table             │          │
│     └───────────────────────────────┘          │
│                                                 │
│  ⚠️ PROBLÈME: 3 sessions différentes!          │
│                                                 │
└─────────────────────────────────────────────────┘

                      ⬇️ F5

┌─────────────────────────────────────────────────┐
│  APRÈS F5                                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. Page recharge                               │
│     └→ stable-session-manager lit localStorage: │
│        stable_session_ABC123                    │
│                                                 │
│  2. Restauration auto                           │
│     └→ Cherche sessionId: stable_session_ABC123 │
│        ❌ Trouve 0 tables (session vide!)      │
│        ❌ NE restaure RIEN                      │
│                                                 │
│  3. Clara redémarre                             │
│     └→ Crée NOUVEAU UUID:                       │
│        f5b7c891-... ❌ (UUID3!)                │
│                                                 │
│  4. User recrée tables                          │
│     └→ Nouvelles tables avec UUID3              │
│                                                 │
│  DOM Storage maintenant:                        │
│     ┌───────────────────────────────┐          │
│     │ Session: stable_session_...   │          │
│     │ Session: a22084a0-... (ancien)│          │
│     │ Session: 39e3da91-... (ancien)│          │
│     │ Session: f5b7c891-... (NOUVEAU)│ ❌      │
│     └───────────────────────────────┘          │
│     4 sessions! Doublons partout!              │
│                                                 │
└─────────────────────────────────────────────────┘

Résultat: ❌ 0-50% restauration, doublons massifs
```

---

## 🔍 LE TRACER EN ACTION

### Comment getSessionIdTraces() Détecte le Problème

```
Temps  │ Source                           │ SessionId
───────┼──────────────────────────────────┼─────────────────────────
0ms    │ stableSessionManager.initialize  │ stable_session_ABC123 ✅
───────┼──────────────────────────────────┼─────────────────────────
500ms  │ React mount                      │ 
       │ window.currentSessionId [SET]    │ a22084a0-e8ab-47... ❌
       │                                  │ ⚠️ ÉCRASE le stable!
───────┼──────────────────────────────────┼─────────────────────────
2s     │ Clara crée table                 │ a22084a0-e8ab-47... ❌
───────┼──────────────────────────────────┼─────────────────────────
5s     │ domStorageManager.saveTable      │ a22084a0-e8ab-47... ❌
───────┼──────────────────────────────────┼─────────────────────────
10s    │ User action                      │
       │ window.currentSessionId [SET]    │ 39e3da91-c410-47... ❌
       │                                  │ ⚠️ NOUVEAU UUID!
───────┼──────────────────────────────────┼─────────────────────────

ANALYSE:
   ✅ SessionIds STABLES: 1
   ❌ SessionIds ANCIENS: 2  ← PROBLÈME ICI!
   
🚨 Clara crée des UUID qui écrasent le stable sessionId!
```

---

## 📊 RAPPORT AVANT/APRÈS

### AVANT (Tests utilisateur actuels)
```
window.getSessionIdTraces()

📊 ANALYSE:
   Total traces: 15
   SessionIds uniques: 3
   
   1. stable_session_1791323719544_qh8nsi81w9 (2 utilisations) ✅
   2. a22084a0-e8ab-47d0-9... (8 utilisations) ❌
   3. 39e3da91-c410-4776-9... (5 utilisations) ❌
   
🔍 DIAGNOSTIC:
   ✅ SessionIds STABLES: 1
   ❌ SessionIds ANCIENS: 2
   
🚨 PROBLÈME DÉTECTÉ:
   Des sessionIds ANCIENS (UUID) sont encore utilisés!
   Clara (React) crée ses propres UUID.
```

### APRÈS (Objectif)
```
window.getSessionIdTraces()

📊 ANALYSE:
   Total traces: 12
   SessionIds uniques: 1
   
   1. stable_session_1791323719544_qh8nsi81w9 (12 utilisations) ✅
   
🔍 DIAGNOSTIC:
   ✅ SessionIds STABLES: 1
   ❌ SessionIds ANCIENS: 0  ← SUCCÈS!
   
✅ SOLUTION FONCTIONNE:
   Un seul sessionId stable utilisé partout!
```

---

## 🎯 TEST RAPIDE VISUEL

### Ce que tu vois en console

#### ❌ MAUVAIS (Problème actuel)
```
🔬 [Trace #1] stableSessionManager.getSessionId()
   SessionId: stable_session_1791323719544_qh8nsi81w9

🔬 [Trace #2] window.currentSessionId [SET]
   SessionId: a22084a0-e8ab-47d0-92c0-a9ca8867d187  ← UUID!

🔬 [Trace #3] domStorageManager.saveTable()
   SessionId: a22084a0-e8ab-47d0-92c0-a9ca8867d187  ← Utilise UUID!
   
⚠️ PROBLÈME: Clara écrase le stable sessionId
```

#### ✅ BON (Objectif)
```
🔬 [Trace #1] stableSessionManager.getSessionId()
   SessionId: stable_session_1791323719544_qh8nsi81w9

🔬 [Trace #2] window.currentSessionId [GET]
   SessionId: stable_session_1791323719544_qh8nsi81w9  ← MÊME!

🔬 [Trace #3] domStorageManager.saveTable()
   SessionId: stable_session_1791323719544_qh8nsi81w9  ← MÊME!
   
✅ SUCCÈS: Tout le monde utilise le même sessionId stable
```

---

## 💡 LA COMMANDE MAGIQUE

```javascript
window.getSessionIdTraces()
```

**Regarde cette ligne:**
```
   ❌ SessionIds ANCIENS: X
```

- Si X = 0 → ✅ Solution fonctionne!
- Si X > 0 → ❌ Problème confirmé (Clara crée des UUID)

---

## 🔧 SOLUTION (à implémenter après diagnostic)

### Option A: Modifier Clara pour utiliser stableSessionManager

**Dans React/Clara, chercher:**
```typescript
// ❌ AVANT (crée UUID)
const sessionId = crypto.randomUUID();
// ou
const sessionId = Math.random().toString();
```

**Remplacer par:**
```typescript
// ✅ APRÈS (utilise stable)
const sessionId = window.stableSessionManager?.getSessionId() 
                  || window.currentSessionId 
                  || 'fallback';
```

### Option B: Empêcher Clara d'écraser window.currentSessionId

**Dans stable-session-manager.js:**
```javascript
// Geler le getter
Object.defineProperty(window, 'currentSessionId', {
  get() { return this._stableId; },
  set(val) { 
    console.warn("⚠️ Tentative écrasement sessionId bloquée:", val);
    // NE PAS écraser
  },
  configurable: false  // ← Empêche redéfinition
});
```

---

## 📋 CHECKLIST VISUELLE

### 1. ⬜ Lancer app + ouvrir console
### 2. ⬜ Taper: `window.getSessionIdTraces()`
### 3. ⬜ Regarder: `❌ SessionIds ANCIENS: X`
### 4. ⬜ Si X > 0 → Problème confirmé
### 5. ⬜ Copier rapport complet
### 6. ⬜ Me l'envoyer

---

**C'EST TOUT !** 🎯

Un seul chiffre (SessionIds ANCIENS) me dit TOUT ce que j'ai besoin de savoir.

---

**Date:** 6 Octobre 2026 - 23h55  
**Version:** Diagnostic Visuel 1.0  
**Status:** Prêt pour test 🚀
