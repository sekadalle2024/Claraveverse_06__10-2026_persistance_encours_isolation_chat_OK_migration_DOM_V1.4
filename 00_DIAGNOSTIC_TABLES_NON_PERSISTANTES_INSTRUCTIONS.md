# 🔍 INSTRUCTIONS DIAGNOSTIC TABLES NON PERSISTANTES

**Date** : 6 Octobre 2026  
**Durée estimée** : 5 minutes  

---

## 📋 RAPPEL DU PROBLÈME

Vous avez constaté que certaines tables ne persistent pas après actualisation :

| Table | Statut |
|-------|--------|
| Table_signature | ✅ Persistante |
| Table_objectif | ✅ Persistante |
| Table_travaux | ✅ Persistante |
| Resultat | ✅ Persistante |
| **Table_conso** | **❌ PAS PERSISTANTE** |
| **Modelised_table** | **⚠️ 50-100% PERSISTANTE** |
| **Table_legend** | **❌ PAS PERSISTANTE** |
| Table_revue_manager | ✅ Persistante |
| Table_cross_manager | ✅ Persistante |

**Paradoxe** : Votre rapport JSON du 6 octobre montre que :
- ✅ Les 12 tests automatisés passent
- ✅ 17 tables sont sauvegardées dans DOM Storage
- ✅ `"Table_Consolidation"` et `"Lgende"` sont **PRÉSENTES** dans le storage

**Mais** : Elles ne réapparaissent pas après actualisation de la page

---

## 🎯 OBJECTIF DU DIAGNOSTIC

Identifier **pourquoi** les tables sont sauvegardées mais pas restaurées.

**Hypothèses principales** :
1. **SessionId change** entre sauvegarde et restauration
2. **Keywords avec accents** causent mismatch (ex: "Légende" vs "Lgende")
3. **GPT régénère** les tables après restauration (écrasement)
4. **Restauration jamais appelée** au chargement de la page

---

## 📝 INSTRUCTIONS

### Étape 1 : Charger le Script de Diagnostic

**Dans la console du navigateur (F12 > Console)** :

```javascript
// Charger le script
const script = document.createElement('script');
script.src = '/diagnostic-tables-non-persistantes.js';
document.head.appendChild(script);
```

**Le script va automatiquement** :
- Exécuter 5 tests de diagnostic
- Afficher les résultats dans la console
- Générer un rapport JSON complet

---

### Étape 2 : Lire les Résultats

Le script affiche dans la console :

```
╔════════════════════════════════════════════════════════════════╗
║  🔍 DIAGNOSTIC TABLES NON PERSISTANTES                        ║
╚════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 TEST 1 : Vérification SessionId
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ window.currentSessionId: aa6b2c8c-b37f-4659-8...
2️⃣ localStorage.currentSessionId: aa6b2c8c-b37f-4659-8...
...
```

**Cherchez les lignes avec** :
- ❌ (problème détecté)
- ⚠️ (avertissement)
- "PROBLÈME DÉTECTÉ"

---

### Étape 3 : Copier le Rapport JSON

**Dans la console** :

```javascript
copy(diagnosticResults)
```

Cela copie le rapport complet dans votre presse-papier.

**Collez-le** dans un fichier texte ou envoyez-le-moi.

---

### Étape 4 : Me Communiquer les Résultats

**Format souhaité** :

```
Test 1 (SessionId):
  [COPIER LA SECTION COMPLÈTE]
  
Test 2 (Restauration):
  [COPIER LA SECTION COMPLÈTE]
  
Test 3 (Keywords):
  [COPIER LA SECTION COMPLÈTE]
  
Test 4 (Table_Consolidation):
  [COPIER LA SECTION COMPLÈTE]
  
Test 5 (Table Légende):
  [COPIER LA SECTION COMPLÈTE]
  
Synthèse:
  [COPIER LA SYNTHÈSE FINALE]
```

**OU** : Me partager le JSON complet (via `copy(diagnosticResults)`)

---

## 🔧 SI VOUS VOULEZ TESTER MANUELLEMENT

### Test Rapide : Vérifier SessionId

```javascript
// AVANT actualisation (après avoir modifié des tables)
console.log("SessionId AVANT:", window.currentSessionId);
localStorage.setItem('test_session_before', window.currentSessionId);

// Actualiser page (F5)

// APRÈS actualisation
console.log("SessionId APRÈS:", window.currentSessionId);
console.log("SessionId stocké:", localStorage.getItem('test_session_before'));
console.log("Identique ?", window.currentSessionId === localStorage.getItem('test_session_before'));
```

**Si "Identique ?" affiche `false`** → Hypothèse 1 confirmée (SessionId change)

---

### Test Rapide : Forcer Restauration

```javascript
// Après actualisation
const sessionId = window.currentSessionId || localStorage.getItem('currentSessionId');
window.domRestoreManager.forceRestore(sessionId);

// Observer si les tables apparaissent
```

**Si les tables apparaissent** → La restauration fonctionne, mais n'est pas appelée automatiquement

---

## 📚 DOCUMENTATION COMPLÈTE

J'ai créé 3 documents pour vous aider :

### 1. **15_EXPLICATION_VISUELLE_PAR_TABLE.md** (68 pages)
- Explication visuelle du système de persistance
- Schémas de timing détaillés
- Problèmes "trop tôt" et "debounce insuffisant"
- Quiz de compréhension

### 2. **16_DIAGNOSTIC_TABLES_NON_PERSISTANTES.md** (45 pages)
- Analyse complète du problème
- 4 hypothèses détaillées
- Tests manuels à exécuter
- 5 solutions proposées selon l'hypothèse confirmée

### 3. **diagnostic-tables-non-persistantes.js** (Script automatisé)
- Exécute 5 tests automatiquement
- Génère rapport JSON
- Affiche diagnostics dans console

---

## 🎯 PROCHAINES ÉTAPES

### Aujourd'hui (Diagnostic)

1. ✅ Exécuter le script de diagnostic
2. ✅ Me communiquer les résultats
3. ✅ Je confirme l'hypothèse exacte

**Durée** : 5 minutes

---

### Demain (Implémentation)

1. Je code la solution précise selon l'hypothèse
2. Vous testez la correction
3. Validation finale avec les 12 tests + tests manuels

**Durée** : 1-2 heures (implémentation + tests)

---

## ❓ QUESTIONS FRÉQUENTES

### Q1 : Le script modifie-t-il mes données ?

**R** : Non, le script est en **lecture seule**. Il ne fait que :
- Lire les données dans DOM Storage
- Comparer avec l'UI
- Afficher les résultats

Aucune modification de vos tables.

### Q2 : Dois-je générer les tables avant le diagnostic ?

**R** : **Idéalement OUI**, mais pas obligatoire.

**Scénario optimal** :
1. Générer toutes les tables (signature, conso, légende, etc.)
2. Modifier quelques cellules
3. Actualiser page (F5)
4. Exécuter diagnostic

Cela permet de voir clairement quelles tables disparaissent.

### Q3 : Que faire si le script ne charge pas ?

**R** : Vérifier que vous êtes sur la page de l'application Claraverse (pas la page de documentation).

**Alternative** : Ouvrir directement le fichier

```javascript
// Méthode alternative
fetch('/diagnostic-tables-non-persistantes.js')
  .then(r => r.text())
  .then(code => eval(code));
```

### Q4 : Les tests 12/12 passent mais tables ne persistent pas, pourquoi ?

**R** : Les 12 tests vérifient que le **système de sauvegarde** fonctionne.

Mais ils ne vérifient PAS :
- Si le sessionId reste stable
- Si la restauration est appelée au chargement
- Si les keywords matchent entre storage et UI

C'est exactement ce que le nouveau diagnostic vérifie ! 🎯

---

## 📞 BESOIN D'AIDE ?

Si vous rencontrez un problème pendant le diagnostic :

1. **Copiez l'erreur** de la console
2. **Faites une capture d'écran** des résultats
3. **Envoyez-moi** les informations

Je vous guiderai pour résoudre le problème.

---

**Date** : 6 Octobre 2026  
**Auteur** : Kiro AI  
**Fichiers créés** :
- `15_EXPLICATION_VISUELLE_PAR_TABLE.md` (68 pages)
- `16_DIAGNOSTIC_TABLES_NON_PERSISTANTES.md` (45 pages)
- `diagnostic-tables-non-persistantes.js` (script automatisé)
- `00_DIAGNOSTIC_TABLES_NON_PERSISTANTES_INSTRUCTIONS.md` (ce fichier)
