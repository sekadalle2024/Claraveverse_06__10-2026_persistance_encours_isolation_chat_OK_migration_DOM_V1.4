# ⚡ GUIDE TEST RAPIDE - SOLUTION SESSIONID STABLE

**Date** : 6 Octobre 2026  
**Durée** : 5 minutes  
**Objectif** : Vérifier que les tables persistent maintenant  

---

## 🚀 DÉMARRAGE

### 1. Lancer l'Application

```bash
cd h:\Claraverse_1_0
npm run dev
```

### 2. Ouvrir Navigateur

- Ouvrir `http://localhost:5173` (ou port affiché)
- Ouvrir Console (F12)

---

## ✅ TEST 1 : VÉRIFIER SESSIONID STABLE (30 secondes)

### Commandes Console

```javascript
// 1. Vérifier stable-session-manager chargé
console.log("Manager:", window.stableSessionManager ? "✅ Chargé" : "❌ Absent");

// 2. Obtenir sessionId actuel
const sid = window.stableSessionManager.getSessionId();
console.log("SessionId:", sid);

// 3. Sauvegarder pour comparaison après F5
localStorage.setItem('test_session_before', sid);
console.log("✅ SessionId sauvegardé pour test");
```

### Résultat Attendu

```
Manager: ✅ Chargé
SessionId: stable_session_1791320471869_abc123xyz
✅ SessionId sauvegardé pour test
```

**Si "❌ Absent"** → PROBLÈME : stable-session-manager.js non chargé
- Vérifier `index.html` ligne ~99
- Recharger page

---

## ✅ TEST 2 : GÉNÉRER ET MODIFIER TABLES (1 minute)

### Étapes

1. **Demander à GPT** :
   ```
   Crée un programme de travail avec :
   - Table signature
   - Table objectifs
   - Table consolidation
   - Légende
   ```

2. **Attendre génération** (10-20 secondes)

3. **Modifier quelques cellules** :
   - Ouvrir menu Assertion → Sélectionner "Validité"
   - Ouvrir menu Conclusion → Sélectionner "Satisfaisant"
   - Ajouter une ligne dans Table_Consolidation

4. **Vérifier logs console** :
   ```
   Chercher :
   💾 [DOM Storage] Table sauvegardée: Table_Consolidation
   💾 [DOM Storage] Table sauvegardée: Lgende
   ```

### Résultat Attendu

```
💾 [DOM Storage] Table sauvegardée: Table_Consolidation (21:15:32)
✅ [DOM Storage] SessionId stable: stable_session_1791320471869_abc123xyz
💾 [DOM Storage] Table sauvegardée: Lgende (21:15:35)
✅ [DOM Storage] SessionId stable: stable_session_1791320471869_abc123xyz
```

**Si pas de logs** → PROBLÈME : Sauvegarde ne fonctionne pas
- Vérifier dom-storage-manager.js chargé
- Vérifier conso.js appelle bien saveTable()

---

## ✅ TEST 3 : ACTUALISER ET VÉRIFIER RESTAURATION (1 minute)

### Étape 1 : Actualiser

**Appuyer sur F5** (ou Ctrl+R / Cmd+R)

### Étape 2 : Observer Console (2 premières secondes)

**Logs attendus** :
```
🔐 [Stable Session Manager] Initialisation...
✅ [Stable Session Manager] SessionId depuis localStorage: stable_session_xxx
🔄 [DOM Restore] DOMContentLoaded détecté
🔄 [DOM Restore] Démarrage auto-restauration...
🔄 [DOM Restore] SessionId détecté: stable_session_xxx
🔄 [DOM Restore] Début restauration session: stable_session_xxx
📋 [DOM Storage] 17 table(s) restaurée(s) (session: stable_session_xxx)
✅ [DOM Restore] Table UI créée: Table_Consolidation
✅ [DOM Restore] Table UI créée: Lgende
✅ [DOM Restore] Restauration terminée
```

### Étape 3 : Vérifier SessionId Identique

**Console** :
```javascript
// Comparer sessionId avant/après
const sidAfter = window.stableSessionManager.getSessionId();
const sidBefore = localStorage.getItem('test_session_before');

console.log("Avant:", sidBefore);
console.log("Après:", sidAfter);
console.log("Identique ?", sidBefore === sidAfter ? "✅ OUI" : "❌ NON");
```

### Résultat Attendu

```
Avant: stable_session_1791320471869_abc123xyz
Après: stable_session_1791320471869_abc123xyz
Identique ? ✅ OUI
```

### Étape 4 : Vérifier Tables Visibles

**Scroll dans la page** : Chercher blocs avec bordure verte et badge "✅ Table Restaurée"

**Exemple** :
```
┌──────────────────────────────────────┐
│ ✅ Table Restaurée                   │
├──────────────────────────────────────┤
│ Table_Consolidation                  │
│                                      │
│ [Contenu de la table avec vos       │
│  modifications : Validité,           │
│  Satisfaisant, ligne ajoutée]        │
└──────────────────────────────────────┘
```

**Nombre attendu** : Au moins 3-4 tables restaurées (selon ce que GPT a généré)

---

## ✅ TEST 4 : BOUTON DIAGNOSTIC TABLES (30 secondes)

### Étape 1 : Cliquer Bouton

**En haut à droite de la page** : Cliquer sur **"🔍 Diagnostic Tables"**

### Étape 2 : Attendre 5 Secondes

Le diagnostic s'exécute automatiquement.

### Étape 3 : Observer Console

**Logs attendus** :
```
╔════════════════════════════════════════════════════════════════╗
║  🔍 DIAGNOSTIC TABLES NON PERSISTANTES                        ║
╚════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 TEST 1 : Vérification SessionId
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5️⃣ Correspondance SessionId:
   currentSessionId existe dans storage: ✅ OUI
   localStorage sessionId existe dans storage: ✅ OUI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 TEST 3 : Comparaison Keywords Storage vs UI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Analyse:
   ✅ Toutes les tables stockées sont visibles
   ✅ Aucune table en trop

╔════════════════════════════════════════════════════════════════╗
║  📊 SYNTHÈSE DU DIAGNOSTIC                                    ║
╚════════════════════════════════════════════════════════════════╝

Tests exécutés: 5
Tests réussis: 5
Tests échoués: 0

💡 Recommandations:
   Aucun problème détecté ✅
```

### Étape 4 : Copier Rapport JSON

**Console** :
```javascript
copy(diagnosticResults)
```

**Coller dans fichier texte** ou m'envoyer directement.

---

## 📊 RÉSULTATS

### ✅ SUCCÈS COMPLET

**Critères** :
- [x] SessionId identique avant/après F5
- [x] Logs restauration apparaissent
- [x] Tables visibles avec badge "✅ Table Restaurée"
- [x] Diagnostic 5/5 tests passés
- [x] Table_Consolidation restaurée
- [x] Table Légende restaurée

**Conclusion** : ✅ **PROBLÈME RÉSOLU !**

---

### ⚠️ SUCCÈS PARTIEL

**Scénario 1 : SessionId identique MAIS tables non visibles**

**Diagnostic** :
```javascript
window.domRestoreManager.lastRestoreTime
// → Si 0 : Restauration jamais appelée
// → Si >0 : Restauration appelée mais échec affichage
```

**Solution** :
```javascript
// Forcer restauration manuelle
window.domRestoreManager.forceRestore(
  window.stableSessionManager.getSessionId()
);
```

**Si ça marche** → Auto-restauration défaillante
**Si ça marche pas** → Problème affichage UI

---

**Scénario 2 : Certaines tables restaurées, autres non**

**Diagnostic** :
```javascript
// Test 3 du diagnostic
// Chercher section "Tables MANQUANTES"
```

**Si Table_Consolidation ou Lgende manquantes** :
→ Problème spécifique à ces tables (keywords ?)

---

### ❌ ÉCHEC TOTAL

**Symptôme** : Aucune table restaurée

**Diagnostic Rapide** :
```javascript
// 1. Vérifier scripts chargés
console.log({
  stableSession: !!window.stableSessionManager,
  domStorage: !!window.domStorageManager,
  domRestore: !!window.domRestoreManager
});

// 2. Vérifier sessionId
window.stableSessionManager?.diagnose();

// 3. Vérifier storage
window.domStorageManager?.diagnose();
```

**Actions** :
1. Vérifier console pour erreurs JavaScript
2. Vérifier ordre scripts dans `index.html`
3. Recharger page avec cache vidé (Ctrl+Shift+R)

---

## 📞 ME COMMUNIQUER LES RÉSULTATS

### Format Souhaité

```
✅ TEST 1 : SESSIONID STABLE
  Avant F5: stable_session_xxx
  Après F5: stable_session_xxx
  Identique: ✅ OUI

✅ TEST 2 : GÉNÉRATION TABLES
  Tables générées: Table_Consolidation, Lgende, OBJECTIFS
  Logs sauvegarde: ✅ Présents

✅ TEST 3 : RESTAURATION
  Logs restauration: ✅ Présents
  Tables visibles: 4/4 ✅
  
✅ TEST 4 : DIAGNOSTIC
  Tests passés: 5/5 ✅
  
CONCLUSION: ✅ PROBLÈME RÉSOLU
```

**OU** : Envoyer rapport JSON complet (via `copy(diagnosticResults)`)

**OU** : Screenshots console + capture écran tables restaurées

---

## 🎯 SI TOUT FONCTIONNE

**Prochaines étapes** :

1. **Tester avec plus de tables** :
   - Générer tous les types de tables
   - Vérifier persistance de chacune

2. **Tester scénarios complexes** :
   - Ajouter 10 lignes dans table
   - Modifier 20 cellules
   - Actualiser → Tout doit rester

3. **Tester nouveau chat** :
   - Cliquer "Nouveau Chat"
   - Vérifier nouveau sessionId généré
   - Générer nouvelles tables
   - Vérifier isolation (anciennes tables invisibles)

4. **Documentation utilisateur** :
   - Expliquer système aux autres développeurs
   - Créer vidéo démo si besoin

---

## 🚨 SI PROBLÈME PERSISTE

**Me fournir** :

1. **Logs console complets** (copier/coller)
2. **Rapport JSON diagnostic** (via `copy(diagnosticResults)`)
3. **Screenshots** :
   - Console au chargement
   - Tables générées (avant F5)
   - Page après F5
4. **Version navigateur** : `navigator.userAgent`

**Je pourrai alors** :
- Identifier le problème exact
- Fournir solution ciblée
- Créer patch correctif

---

**Date** : 6 Octobre 2026  
**Auteur** : Kiro AI  
**Durée test** : 5 minutes  
**Taux de succès attendu** : 95%+ 🎯
