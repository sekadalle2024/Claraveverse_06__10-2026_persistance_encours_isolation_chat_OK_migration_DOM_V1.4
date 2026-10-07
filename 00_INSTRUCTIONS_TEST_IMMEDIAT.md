# 🚀 INSTRUCTIONS TEST IMMÉDIAT

**Date:** 6 Octobre 2026 - 23h40  
**Objectif:** Identifier la source du problème sessionId

---

## ⚡ DÉMARRAGE RAPIDE (2 minutes)

### 1. Lancer l'Application
```powershell
cd h:\Claraverse_1_0
npm run dev
```

Ouvrir: http://localhost:5173

---

### 2. Ouvrir Console (F12)
Appuyer sur **F12** pour ouvrir Developer Tools  
Onglet **Console**

---

### 3. Vérifier Chargement Système
Chercher dans console:
```
✅ [Stable Session Manager] Initialisation...
✅ [Stable Session] SessionId depuis localStorage: stable_session_...
✅ Tracer installé - Utilisez window.getSessionIdTraces()
```

**Si vous voyez ces 3 lignes ✅** → Système chargé correctement

---

### 4. Créer des Tables avec Clara
Demander à Clara:
```
"Peux-tu créer une table de travaux d'audit avec 5 lignes ?
Et ensuite totaliser cette table."
```

Attendre que Clara génère:
- Une table normale
- Table_Consolidation (totalisation)
- Table Resultat

---

### 5. COMMANDE CRITIQUE (AVANT F5)
**Dans la console, taper EXACTEMENT :**
```javascript
window.getSessionIdTraces()
```

**Regarder le rapport :**
```
📊 RAPPORT SESSIONID - X événements
🔍 DIAGNOSTIC:
   ✅ SessionIds STABLES: X
   ❌ SessionIds ANCIENS: X
```

---

## 🎯 ANALYSE RÉSULTAT

### ✅ CAS 1: Tout est Stable
```
📊 RAPPORT:
   ✅ SessionIds STABLES: 1
   ❌ SessionIds ANCIENS: 0
```

**→ SOLUTION FONCTIONNE !** 🎉  
Passer à l'étape 6 (test F5)

---

### ❌ CAS 2: Anciens SessionIds Détectés
```
📊 RAPPORT:
   ✅ SessionIds STABLES: 2
   ❌ SessionIds ANCIENS: 1   ← PROBLÈME !
   
🚨 PROBLÈME DÉTECTÉ:
   Des sessionIds ANCIENS (UUID) sont encore utilisés !
```

**→ PROBLÈME IDENTIFIÉ !**  
Clara (React) crée encore des UUID

**Action:** Copier le rapport complet
```javascript
copy(JSON.stringify(window.getSessionIdTraces(), null, 2))
```

Coller dans un fichier `rapport-sessionid.json`  
**ME L'ENVOYER** 📧

---

## 🔍 TEST 2: Table_Consolidation

**Dans console:**
```javascript
window.diagnosticTableConso()
```

**Analyser:**
```
✅ Recherche Table_Consolidation dans DOM
   → Présente ? ✅/❌

✅ Recherche dans DOM Storage Container
   → Présente ? ✅/❌

🎯 CONCLUSION:
   ❌ Table_Consolidation ABSENTE du DOM et du Storage
   OU
   ⚠️ Table_Consolidation PRÉSENTE dans DOM mais PAS dans Storage
```

**Si problème, copier:**
```javascript
copy(JSON.stringify(window.diagnosticTableConso(), null, 2))
```

---

## 🔄 TEST 3: Après F5

### 1. Appuyer sur F5
Attendre 3 secondes (restauration automatique)

### 2. Vérifier Console
Chercher:
```
[DOM Restore] Restauration session: stable_session_...
✅ Table Restaurée (X fois)
```

### 3. Relancer Tracer
```javascript
window.getSessionIdTraces()
```

**COMPARER AVANT/APRÈS F5:**
- SessionId identique ? ✅ SUCCÈS
- SessionId différent ? ❌ ÉCHEC

---

## 📊 RAPPORT COMPLET À FOURNIR

**Exécuter dans l'ordre et copier résultats:**

```javascript
console.log("========== RAPPORT AVANT F5 ==========");

// 1. Tracer SessionId
const trace1 = window.getSessionIdTraces();
console.log("1. SessionId Traces:", trace1);

// 2. Diagnostic Table_Consolidation
const diag1 = window.diagnosticTableConso();
console.log("2. Diagnostic Table_Conso:", diag1);

// 3. Copier tout
copy(JSON.stringify({
  beforeF5: {
    sessionTraces: trace1,
    tableConso: diag1,
    timestamp: new Date().toISOString()
  }
}, null, 2));

console.log("✅ Rapport AVANT F5 copié dans presse-papier");
```

**→ Coller dans fichier `rapport-avant-f5.json`**

---

**Ensuite APPUYER SUR F5**

---

```javascript
console.log("========== RAPPORT APRÈS F5 ==========");

// Attendre 3 secondes
setTimeout(() => {
  
  // 1. Tracer SessionId
  const trace2 = window.getSessionIdTraces();
  console.log("1. SessionId Traces:", trace2);
  
  // 2. Diagnostic Table_Consolidation
  const diag2 = window.diagnosticTableConso();
  console.log("2. Diagnostic Table_Conso:", diag2);
  
  // 3. Copier tout
  copy(JSON.stringify({
    afterF5: {
      sessionTraces: trace2,
      tableConso: diag2,
      timestamp: new Date().toISOString()
    }
  }, null, 2));
  
  console.log("✅ Rapport APRÈS F5 copié dans presse-papier");
  
}, 3000);
```

**→ Coller dans fichier `rapport-apres-f5.json`**

---

## 🎯 FICHIERS À M'ENVOYER

1. **`rapport-avant-f5.json`** (résultat copié AVANT F5)
2. **`rapport-apres-f5.json`** (résultat copié APRÈS F5)
3. **Screenshots console** montrant les messages de chargement

---

## 💡 ALTERNATIVE RAPIDE

Si trop complexe, simplement :

**1. Lancer app**  
**2. Console F12**  
**3. Taper:**
```javascript
window.getSessionIdTraces()
```

**4. Me dire:**
- Combien de sessionIds STABLES ?
- Combien de sessionIds ANCIENS ?

**C'est l'info la plus critique !**

---

## ❓ Questions Rapides

### Q: Le bouton "🔍 Diagnostic Tables" ne marche pas
**R:** Utiliser console directement :
```javascript
window.diagnosticTableConso()
```

### Q: Erreur "getSessionIdTraces is not a function"
**R:** Scripts non chargés. Vérifier console pour erreurs 404.  
Recharger avec `Ctrl + Shift + R`

### Q: Rien ne s'affiche en console
**R:** Vérifier onglet Console (pas Elements, ni Network)

### Q: Trop de messages, difficile à lire
**R:** Cliquer icône "Effacer console" (🚫 en haut à gauche de console)  
Puis relancer commandes

---

## ✅ CHECKLIST

- [ ] Application démarrée
- [ ] Console F12 ouverte
- [ ] Messages chargement vus (Stable Session Manager)
- [ ] Tables créées avec Clara
- [ ] `window.getSessionIdTraces()` exécuté AVANT F5
- [ ] Résultat copié dans fichier
- [ ] F5 pressé
- [ ] `window.getSessionIdTraces()` exécuté APRÈS F5
- [ ] Résultat copié dans fichier
- [ ] Fichiers prêts à envoyer

---

**PRÊT POUR TEST ? 🚀**

**Temps estimé:** 5 minutes  
**Difficulté:** ⭐⭐ (Facile - Copier/Coller)

---

**Date:** 6 Octobre 2026 - 23h40  
**Status:** Guide prêt pour test utilisateur 📋
