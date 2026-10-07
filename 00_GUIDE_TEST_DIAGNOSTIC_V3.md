# 🔬 GUIDE TEST DIAGNOSTIC V3
**Date:** 6 Octobre 2026 - 23h30  
**Objectif:** Tracer pourquoi sessionId change et Table_Consolidation ne persiste pas

---

## 📋 Étapes de Test

### 1. Démarrer Claraverse

```powershell
cd h:\Claraverse_1_0
npm run dev
```

Ouvrir http://localhost:5173

---

### 2. Ouvrir la Console (F12)

Vérifier les messages de démarrage :
- ✅ `[Stable Session Manager] Initialisation...`
- ✅ `[Stable Session] SessionId depuis localStorage: stable_session_...`
- ✅ `Tracer installé - Utilisez window.getSessionIdTraces()`

---

### 3. Créer des Tables avec Clara

Demander à Clara de créer des tables incluant :
- Table_Consolidation (via totalisation)
- Table Resultat (via totalisation)
- Autres tables (signature, entête, etc.)

---

### 4. AVANT F5 - Exécuter les Diagnostics

#### 4.1 Tracer SessionId

```javascript
window.getSessionIdTraces()
```

**Analyser le rapport :**
- ✅ Nombre de sessionIds STABLES (format `stable_session_...`)
- ❌ Nombre de sessionIds ANCIENS (format UUID `xxxxxx-xxxx-...`)

**PROBLÈME SI :** Des sessionIds anciens (UUID) apparaissent
→ Cela signifie que stable-session-manager n'est pas actif partout

---

#### 4.2 Diagnostic Table_Consolidation

```javascript
window.diagnosticTableConso()
```

**Analyser le rapport :**
- Présence dans DOM ?
- Présence dans Storage ?
- Listeners installés ?
- Comparaison avec Table Resultat

---

#### 4.3 Diagnostic Complet (bouton ou console)

```javascript
// Via bouton "🔍 Diagnostic Complet"
// OU en console :
copy(JSON.stringify(window.runFullDiagnostic(), null, 2))
```

**Vérifier :**
- Nombre de sessions dans DOM Storage
- Quels sessionIds sont utilisés ?
- Combien de tables par session ?

---

### 5. Appuyer sur F5 (Actualiser)

Attendre 2-3 secondes que la restauration auto se fasse.

---

### 6. APRÈS F5 - Vérifier Restauration

#### 6.1 Console

Chercher :
- `[DOM Restore] Restauration session: stable_session_...`
- `✅ Table Restaurée` (badges verts sur tables)

#### 6.2 Tracer à Nouveau

```javascript
window.getSessionIdTraces()
```

**Comparer AVANT/APRÈS F5 :**
- Le sessionId est-il resté le MÊME ?
- Ou un nouveau sessionId a été créé ?

---

### 7. Diagnostic Table_Consolidation APRÈS F5

```javascript
window.diagnosticTableConso()
```

**Questions clés :**
- Table_Consolidation présente dans Storage AVANT F5 ?
- Table_Consolidation restaurée dans DOM APRÈS F5 ?
- Pourquoi Resultat OUI mais Consolidation NON ?

---

## 🎯 Scénarios Attendus

### ✅ Scénario SUCCÈS (attendu)

1. **AVANT F5:**
   - `getSessionIdTraces()` montre 1 seul sessionId STABLE
   - `diagnosticTableConso()` montre Table_Consolidation dans Storage
   - Toutes tables ont le même sessionId

2. **APRÈS F5:**
   - `getSessionIdTraces()` montre le MÊME sessionId qu'avant
   - Table_Consolidation restaurée avec badge ✅
   - Console montre `[DOM Restore] X tables restaurées`

---

### ❌ Scénario ÉCHEC (actuel)

1. **AVANT F5:**
   - `getSessionIdTraces()` montre **3 sessionIds différents** dont 2 anciens (UUID)
   - `diagnosticTableConso()` montre Table_Consolidation dans Storage **sous sessionId différent**
   - Tables réparties sur plusieurs sessions

2. **APRÈS F5:**
   - Nouveau sessionId créé (4ème session !)
   - Table_Consolidation PAS restaurée (sessionId différent)
   - Doublons de tables (anciennes + nouvelles sessions)

---

## 📊 Rapport à Fournir

Copier ces 3 rapports dans un fichier texte :

```javascript
// 1. Tracer SessionId AVANT F5
console.log("========== AVANT F5 ==========");
copy(JSON.stringify(window.getSessionIdTraces(), null, 2));

// 2. Diagnostic Table_Consolidation AVANT F5
copy(JSON.stringify(window.diagnosticTableConso(), null, 2));

// 3. Diagnostic Complet AVANT F5
copy(JSON.stringify(window.runFullDiagnostic(), null, 2));

// Appuyer sur F5

// 4. Tracer SessionId APRÈS F5
console.log("========== APRÈS F5 ==========");
copy(JSON.stringify(window.getSessionIdTraces(), null, 2));

// 5. Diagnostic Table_Consolidation APRÈS F5
copy(JSON.stringify(window.diagnosticTableConso(), null, 2));
```

---

## 🔍 Hypothèses à Vérifier

### Hypothèse A: SessionId change à cause de Clara (React)

**Si:** `getSessionIdTraces()` montre des sessionIds UUID créés **après** stable_session  
**Alors:** Clara (React) crée de nouveaux sessionIds qui écrasent le stable  
**Solution:** Modifier Clara pour utiliser `window.stableSessionManager.getSessionId()`

---

### Hypothèse B: Table_Consolidation utilise mauvais keyword

**Si:** `diagnosticTableConso()` montre Table_Consolidation avec keyword différent de Storage  
**Alors:** Mismatch entre sauvegarde (Table_Consolidation) et restauration (autre keyword)  
**Solution:** Normaliser les keywords dans conso.js

---

### Hypothèse C: Listener de sauvegarde manquant

**Si:** `diagnosticTableConso()` montre Table_Consolidation dans DOM mais PAS Storage  
**Alors:** Listeners auto-save non installés sur cette table  
**Solution:** Vérifier pourquoi dom-auto-save ignore cette table

---

### Hypothèse D: Timing - Table créée après checkpoint

**Si:** Table_Consolidation créée juste avant F5 mais après dernier checkpoint  
**Alors:** La table n'a jamais été sauvegardée  
**Solution:** Forcer checkpoint avant F5 avec `window.domCheckpointSaver.forceCheckpoint()`

---

## 🚀 Actions Immédiates

1. Lancer l'application
2. Exécuter `window.getSessionIdTraces()` toutes les 10 secondes pendant 1 minute
3. Observer quand les sessionIds UUID apparaissent
4. Identifier quelle fonction crée ces UUID
5. Modifier cette fonction pour utiliser stable-session-manager

---

**Prêt pour le test ?** 🎯
