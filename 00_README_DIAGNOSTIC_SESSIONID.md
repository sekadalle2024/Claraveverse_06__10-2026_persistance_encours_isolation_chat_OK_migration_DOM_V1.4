# 📚 README - Diagnostic SessionId Instable

**Date:** 6 Octobre 2026  
**Version:** 2.0  
**Système:** Claraverse - Persistance Tables

---

## 🎯 OBJECTIF

Identifier pourquoi le **sessionId stable** ne fonctionne pas :
- 3 sessionIds différents actifs simultanément
- SessionIds UUID (ancien format) créés malgré stable-session-manager
- Table_Consolidation ne persiste JAMAIS (0% restauration)
- Doublons de tables

---

## ⚡ DÉMARRAGE ULTRA-RAPIDE (30 secondes)

1. **Lancer app:** `npm run dev` → http://localhost:5173
2. **Console F12**
3. **Taper:** `window.getSessionIdTraces()`
4. **Regarder:** Ligne `❌ SessionIds ANCIENS: X`
5. **Me dire:** Le nombre X

**Si X = 0** → ✅ Solution fonctionne  
**Si X > 0** → ❌ Problème confirmé (Clara crée UUID)

---

## 📖 GUIDES DISPONIBLES

### Pour Utilisateurs

| Fichier | Temps | Difficulté | Usage |
|---------|-------|------------|-------|
| **`00_START_HERE.md`** | 2 min | ⭐ | TEST IMMÉDIAT |
| **`00_DIAGNOSTIC_VISUEL.md`** | 5 min | ⭐ | Schémas visuels |
| **`00_INSTRUCTIONS_TEST_IMMEDIAT.md`** | 5 min | ⭐⭐ | Guide rapide |
| **`00_GUIDE_TEST_DIAGNOSTIC_V3.md`** | 15 min | ⭐⭐⭐ | Guide complet |

### Pour Développeurs

| Fichier | Contenu |
|---------|---------|
| **`00_RECAP_SESSION_6_OCTOBRE_23H.md`** | Récap complet session |
| **`00_INDEX_NOUVEAUX_FICHIERS_6_OCT_23H.md`** | Index tous fichiers |
| **`00_FIX_BOUTON_DIAGNOSTIC_TABLES.md`** | Dépannage bouton |
| **`MEMO_PROGRESSIF_SYSTEME_PERSISTANCE.md`** | Historique problèmes |

---

## 🔧 OUTILS DIAGNOSTICS

### 1. Tracer SessionId
```javascript
window.getSessionIdTraces()
```

**Détecte:**
- SessionIds STABLES (format `stable_session_...`) ✅
- SessionIds ANCIENS (format UUID) ❌
- Quand les UUID sont créés
- Quelle fonction les crée

**Fichier:** `public/diagnostic-sessionid-tracer.js` (150 lignes)

---

### 2. Diagnostic Table_Consolidation
```javascript
window.diagnosticTableConso()
```

**Détecte:**
- Table présente dans DOM ?
- Table sauvegardée dans Storage ?
- Listeners installés ?
- Pourquoi Resultat persiste mais pas Consolidation ?

**Fichier:** `public/diagnostic-table-conso.js` (180 lignes)

---

### 3. Diagnostic Complet
```javascript
window.runFullDiagnostic()
```

**Détecte:**
- Vue d'ensemble système
- Toutes tables
- Tous tests (17 tests)

**Fichier:** `public/diagnostic-complet-dom-storage.js` (existant)

---

## 🎨 SCHÉMA PROBLÈME

### Ce qui se passe (ACTUEL) ❌
```
1. stable-session-manager crée: stable_session_ABC123 ✅
2. Clara (React) écrase avec UUID: a22084a0-e8ab-47... ❌
3. Tables sauvegardées avec différents sessionIds
4. F5 → Restauration cherche stable_session_ABC123
5. Ne trouve rien (tables sous autres sessionIds)
6. 0% restauration ❌
```

### Ce qui devrait se passer (OBJECTIF) ✅
```
1. stable-session-manager crée: stable_session_ABC123 ✅
2. Clara utilise ce MÊME sessionId ✅
3. TOUTES tables avec stable_session_ABC123
4. F5 → Restauration cherche stable_session_ABC123
5. Trouve TOUTES les tables ✅
6. 100% restauration ✅
```

---

## 📊 HYPOTHÈSES

### 🔴 Hypothèse A: Clara crée UUID (PROBABILITÉ: 90%)

**Indice:** UUID apparaissent APRÈS chargement stable-session  
**Test:** `getSessionIdTraces()` montre sessionIds ANCIENS  
**Solution:** Modifier React pour utiliser `window.stableSessionManager.getSessionId()`

---

### 🟡 Hypothèse B: Keyword mismatch (PROBABILITÉ: 50%)

**Indice:** Table Resultat persiste, Table_Consolidation NON  
**Test:** `diagnosticTableConso()` montre keyword différent  
**Solution:** Normaliser keywords dans conso.js

---

### 🟢 Hypothèse C: Timing checkpoint (PROBABILITÉ: 20%)

**Indice:** Table créée après dernier checkpoint  
**Test:** Observer logs console pendant F5  
**Solution:** Forcer checkpoint plus agressif

---

## 📁 STRUCTURE FICHIERS

```
h:\Claraverse_1_0\
│
├── 00_README_DIAGNOSTIC_SESSIONID.md     ← CE FICHIER
├── 00_START_HERE.md                      ← DÉMARRAGE RAPIDE
├── 00_DIAGNOSTIC_VISUEL.md               ← Schémas
├── 00_INSTRUCTIONS_TEST_IMMEDIAT.md      ← Guide 5 min
├── 00_GUIDE_TEST_DIAGNOSTIC_V3.md        ← Guide complet
├── 00_FIX_BOUTON_DIAGNOSTIC_TABLES.md
├── 00_RECAP_SESSION_6_OCTOBRE_23H.md
├── 00_INDEX_NOUVEAUX_FICHIERS_6_OCT_23H.md
│
├── index.html                             ← Modifié (+2 scripts)
│
└── public\
    ├── diagnostic-sessionid-tracer.js     ← NOUVEAU (Trace sessionId)
    ├── diagnostic-table-conso.js          ← NOUVEAU (Analyse Table_Conso)
    │
    ├── stable-session-manager.js          ← Solution Hypothèse 1.1
    ├── dom-storage-manager.js
    ├── dom-restore-manager.js
    ├── dom-auto-save.js
    ├── dom-checkpoint-saver.js
    ├── diagnostic-complet-dom-storage.js
    ├── diagnostic-tables-non-persistantes.js
    └── verif-installation-solution.js
```

---

## ✅ CHECKLIST TEST

### Phase 1: Diagnostic Rapide (2 min)
- [ ] Lancer app (`npm run dev`)
- [ ] Console F12
- [ ] Taper: `window.getSessionIdTraces()`
- [ ] Noter: Nombre sessionIds ANCIENS

**Si ANCIENS = 0** → ✅ Passer Phase 2  
**Si ANCIENS > 0** → ❌ Problème confirmé, fournir rapport

---

### Phase 2: Test Restauration (3 min)
- [ ] Créer tables avec Clara
- [ ] Modifier quelques cellules
- [ ] Appuyer F5
- [ ] Vérifier badges "✅ Table Restaurée"
- [ ] Compter % tables restaurées

**Si 100%** → ✅ Succès complet  
**Si <100%** → Exécuter Phase 3

---

### Phase 3: Diagnostic Approfondi (5 min)
- [ ] AVANT F5: `copy(JSON.stringify(window.getSessionIdTraces(), null, 2))`
- [ ] AVANT F5: `copy(JSON.stringify(window.diagnosticTableConso(), null, 2))`
- [ ] Appuyer F5
- [ ] APRÈS F5: Répéter les 2 commandes
- [ ] Fournir les 4 rapports JSON

---

## 📤 RAPPORTS À FOURNIR

### Option 1: Rapport Minimal (30 sec)
```
SessionIds ANCIENS: X
Status: BON ✅ / MAUVAIS ❌
```

### Option 2: Rapport Complet (2 min)
```javascript
// AVANT F5
copy(JSON.stringify({
  trace: window.getSessionIdTraces(),
  conso: window.diagnosticTableConso()
}, null, 2))

// F5

// APRÈS F5
copy(JSON.stringify({
  trace: window.getSessionIdTraces(),
  conso: window.diagnosticTableConso()
}, null, 2))
```

Coller dans 2 fichiers:
- `rapport-avant-f5.json`
- `rapport-apres-f5.json`

---

## ❓ FAQ

### Q: "getSessionIdTraces is not a function"
**R:** Scripts non chargés. Recharger: `Ctrl + Shift + R`

### Q: Bouton "🔍 Diagnostic Tables" ne marche pas
**R:** Utiliser console: `window.diagnosticTableConso()`

### Q: Trop de messages console
**R:** Cliquer 🚫 (Effacer console) puis relancer

### Q: Je n'ai que 30 secondes
**R:** 
1. Console F12
2. Taper: `window.getSessionIdTraces()`
3. Regarder: `❌ SessionIds ANCIENS: X`
4. Me dire X

---

## 🚀 PROCHAINES ÉTAPES

### Si SessionIds ANCIENS > 0 (Hypothèse A confirmée)
1. Rechercher dans React où sessionId est créé
2. Chercher: `crypto.randomUUID()` ou `Math.random()`
3. Remplacer par: `window.stableSessionManager.getSessionId()`
4. Rebuild React
5. Retester

### Si Table_Consolidation dans DOM mais pas Storage
1. Vérifier keywords exact (sauvegarde vs restauration)
2. Vérifier listeners installés sur table
3. Ajouter logs dans conso.js
4. Retester

---

## 📞 CONTACT

**Fournir:**
- Résultat `getSessionIdTraces()` (nombre ANCIENS)
- OU fichiers JSON complets (avant/après F5)
- OU screenshots console

**Format:** 
- JSON copié depuis console
- Texte simple
- Capture écran

---

## 📊 STATISTIQUES PROJET

**Session:** 6 Octobre 2026 - 23h  
**Durée:** ~1 heure  

**Fichiers créés:** 9
- Documentation: 7 fichiers (680 lignes MD)
- Scripts JS: 2 fichiers (330 lignes)

**Modifications:** 1
- index.html: +2 lignes (chargement scripts)

**Outils diagnostics:** 10 scripts totaux

---

## 🎯 TL;DR

**1 COMMANDE MAGIQUE:**
```javascript
window.getSessionIdTraces()
```

**1 LIGNE À REGARDER:**
```
❌ SessionIds ANCIENS: X
```

**SI X = 0** → ✅ Ça marche !  
**SI X > 0** → ❌ Problème (Clara crée UUID)

**C'EST TOUT !** 🚀

---

**Date:** 6 Octobre 2026 - 00h00  
**Version:** README Diagnostic 1.0  
**Status:** Prêt pour test final 📋
