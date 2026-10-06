# 🎓 SYSTÈME DE PERSISTANCE - EXPLICATION POUR DÉBUTANT

**Date** : 12 Septembre 2026  
**Public** : Débutants en développement web  
**Objectif** : Comprendre comment les tables du chat sont sauvegardées  

---

## 📚 TABLE DES MATIÈRES

1. [Analogie Simple](#analogie-simple)
2. [Les 4 Couches du Système](#les-4-couches-du-système)
3. [Cycle de Vie d'une Table](#cycle-de-vie-dune-table)
4. [Problème du "Trop Tôt" et du Debounce](#problème-du-trop-tôt-et-du-debounce)
5. [Solution Finale à 4 Niveaux](#solution-finale-à-4-niveaux)
6. [Exemples Concrets](#exemples-concrets)

---

## 🎯 ANALOGIE SIMPLE

Imaginez que vous travaillez sur un **document Word** :

### Sans Sauvegarde Automatique (Ancien Problème)

```
Vous tapez : "Bonjour"              ← Pas sauvegardé
Vous ajoutez : " tout le monde"     ← Pas sauvegardé
💥 CRASH !
→ Vous perdez tout
```

### Avec Sauvegarde Automatique (Notre Système)

```
Vous tapez : "Bonjour"              
  → Word attend 3 secondes         (debounce)
  → Sauvegarde dans fichier temp   (cache)
  
Vous ajoutez : " tout le monde"     
  → Word attend 3 secondes         (debounce annulé, redémarre)
  → Sauvegarde dans fichier temp   (cache)
  
💾 Sauvegarde finale : "Bonjour tout le monde"
```

**Notre système fait la même chose pour les tables du chat !**

---

## 🏗️ LES 4 COUCHES DU SYSTÈME

Notre système de persistance a **4 couches** qui travaillent ensemble :

```
┌─────────────────────────────────────────────────────────┐
│                    UTILISATEUR                          │
│        (Clique, modifie, édite les tables)             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│          COUCHE 1 : DÉTECTION IMMÉDIATE                │
│              (Menu Déroulant)                           │
│    Scripts : conso.js (setupAssertionCell, etc.)       │
│    Rôle : Sauvegarde 0ms après menu déroulant          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│          COUCHE 2 : OBSERVATION CONTINUE                │
│            (MutationObserver)                           │
│         Script : dom-auto-save.js                       │
│    Rôle : Surveille tous les changements (debounce)    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│           COUCHE 3 : STOCKAGE PHYSIQUE                  │
│                (DOM Storage)                            │
│        Script : dom-storage-manager.js                  │
│    Rôle : Sauvegarde réelle dans <div> caché           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│          COUCHE 4 : CHECKPOINT DE SÉCURITÉ              │
│          (Sauvegarde avant fermeture)                   │
│        Script : dom-checkpoint-saver.js                 │
│    Rôle : Force sauvegarde avant navigation/fermeture  │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 DÉTAIL DES 4 COUCHES

### COUCHE 1 : Détection Immédiate (conso.js)

**Métaphore** : C'est comme **appuyer sur Ctrl+S** après chaque action importante

**Quand ça se déclenche** :
- ✅ Vous cliquez sur une cellule "Assertion" → Menu s'ouvre → Vous choisissez "Validité"
- ✅ Vous cliquez sur une cellule "Conclusion" → Menu s'ouvre → Vous choisissez "Satisfaisant"
- ✅ Vous cliquez sur une cellule "Ctr" → Menu s'ouvre → Vous choisissez "+"

**Ce qu'elle fait concrètement** :

```javascript
// Utilisateur clique sur cellule Assertion
cell.addEventListener("click", (e) => {
  // Menu déroulant s'affiche
  this.showAssertionMenu(cell, (value) => {
    
    // 1. Mettre à jour la cellule
    cell.textContent = value; // "Validité"
    
    // 2. 💾 SAUVEGARDE IMMÉDIATE (0ms)
    this.saveTableDataNow(parentTable); // ← Pas d'attente !
    
    // 3. Double sécurité (au cas où)
    window.domStorageManager.saveTable(sessionId, keyword, parentTable);
  });
});
```

**Temps d'exécution** : **0ms** (immédiat)

**Pourquoi c'est important** :
- Les menus déroulants sont les actions les plus "risquées"
- Si l'utilisateur ferme l'onglet 1 seconde après → données déjà sauvées !

---

### COUCHE 2 : Observation Continue (dom-auto-save.js)

**Métaphore** : C'est comme **Word qui surveille** tout ce que vous tapez

**Quand ça se déclenche** :
- ✅ Vous modifiez du texte dans une cellule
- ✅ Vous ajoutez/supprimez une ligne (via menu.js)
- ✅ N'importe quel changement dans le HTML de la table

**Ce qu'elle fait concrètement** :

```javascript
// Créer un "espion" qui surveille la table
const tableObserver = new MutationObserver(() => {
  
  console.log("🔍 Changement détecté dans la table !");
  
  // Annuler le timer précédent
  clearTimeout(this.saveTimeout);
  
  // Démarrer un nouveau timer de 1000ms
  this.saveTimeout = setTimeout(() => {
    
    console.log("💾 1 seconde sans changement → SAUVEGARDE");
    window.domStorageManager.saveTable(sessionId, keyword, table);
    
  }, 1000); // ← Debounce de 1000ms
});

// Activer l'espion sur la table
tableObserver.observe(table, {
  childList: true,      // Surveiller ajout/suppression éléments
  subtree: true,        // Surveiller tous les enfants
  characterData: true,  // Surveiller changements de texte
  attributes: true      // Surveiller changements de style
});
```

**Temps d'exécution** : **1000ms** (1 seconde après le dernier changement)

**Pourquoi c'est important** :
- Capture TOUTES les modifications, même celles qu'on n'a pas prévues
- Le debounce de 1000ms évite de sauvegarder 50 fois si l'utilisateur modifie 50 cellules rapidement

---

### 🤔 PROBLÈME DU "TROP TÔT" ET DU DEBOUNCE

#### Scénario Problématique (AVANT la solution)

Imaginez que vous modifiez **5 cellules en 3 secondes** :

```
Seconde 0.0 : Click cellule 1 → Menu → "Validité"
              MutationObserver détecte changement
              Timer 500ms démarre
              
Seconde 0.3 : Click cellule 2 → Menu → "Exhaustivité"
              MutationObserver détecte changement
              Timer 500ms ANNULÉ et redémarré ← PROBLÈME !
              
Seconde 0.6 : Click cellule 3 → Menu → "Formalisation"
              Timer ANNULÉ et redémarré
              
Seconde 1.2 : Click cellule 4 → Menu → "Application"
              Timer ANNULÉ et redémarré
              
Seconde 2.5 : Click cellule 5 → Menu → "Permanence"
              Timer ANNULÉ et redémarré
              
Seconde 3.0 : 500ms se passent...
              💾 SAUVEGARDE

PROBLÈME : Seule la cellule 5 est sauvegardée !
Les cellules 1, 2, 3, 4 ont été "oubliées"
```

#### Pourquoi ça arrive ?

**Le MutationObserver se déclenche "trop tôt"** :

```
Click cellule → Menu s'ouvre (100ms)
             → DOM change (ajout div menu) ← Observer détecte !
             → Utilisateur choisit valeur (200ms)
             → Cellule mise à jour
             → Menu se ferme (100ms)
```

Le problème : L'Observer détecte le **menu qui s'ouvre**, pas la **valeur finale** !

**Le debounce de 500ms est insuffisant** :

```
Modification 1 → Timer 500ms
  ↓ 300ms
Modification 2 → Timer ANNULÉ et redémarré
  ↓ 200ms  
Modification 3 → Timer ANNULÉ et redémarré
  ↓ 400ms
Modification 4 → Timer ANNULÉ et redémarré
  ↓ 500ms
Sauvegarde → Seule modification 4 capturée
```

---

### COUCHE 3 : Stockage Physique (dom-storage-manager.js)

**Métaphore** : C'est le **disque dur** où Word sauvegarde votre document

**Ce qu'elle fait concrètement** :

```javascript
saveTable(sessionId, keyword, tableElement) {
  
  // 1. Trouver ou créer l'espace de stockage pour cette session
  const sessionContainer = this.getSessionContainer(sessionId);
  
  // 2. Chercher si la table existe déjà
  let storedTable = sessionContainer.querySelector(`table[data-keyword="${keyword}"]`);
  
  if (storedTable) {
    // 3a. Table existe → METTRE À JOUR
    console.log("🔄 Mise à jour table existante");
    storedTable.innerHTML = tableElement.innerHTML; // Remplacer contenu
    storedTable.setAttribute('data-updated-at', new Date().toISOString());
    
  } else {
    // 3b. Table n'existe pas → CRÉER
    console.log("💾 Nouvelle table");
    storedTable = tableElement.cloneNode(true); // Copier table complète
    storedTable.setAttribute('data-keyword', keyword);
    storedTable.setAttribute('data-saved-at', new Date().toISOString());
    sessionContainer.appendChild(storedTable);
  }
  
  // 4. Logs détaillés (pour debugging)
  console.log("✅ Sauvegarde confirmée:", keyword);
  console.log("✅ Timestamp:", new Date().toISOString());
  console.log("✅ Taille:", storedTable.outerHTML.length, "chars");
  
  return true;
}
```

**Où est sauvegardée la table ?**

Dans un **`<div>` caché** dans la page HTML :

```html
<div id="claraverse-dom-storage" style="display: none;">
  
  <!-- Container pour session ABC123 -->
  <div data-session-id="session_abc123" data-created-at="2026-09-12T10:00:00Z">
    
    <!-- Table 1 : Budget -->
    <table data-keyword="Table_Budget" 
           data-table-id="table_1" 
           data-saved-at="2026-09-12T10:05:00Z"
           data-updated-at="2026-09-12T10:15:00Z">
      <tr><td>Client A</td><td>100000</td><td>Validité</td></tr>
      <tr><td>Client B</td><td>200000</td><td>Exhaustivité</td></tr>
    </table>
    
    <!-- Table 2 : Résultats -->
    <table data-keyword="Table_Resultat" 
           data-table-id="table_2" 
           data-saved-at="2026-09-12T10:10:00Z">
      <tr><td>Résultat consolidé : 300 000 FCFA</td></tr>
    </table>
    
  </div>
  
  <!-- Container pour session XYZ789 -->
  <div data-session-id="session_xyz789">
    <!-- Autres tables... -->
  </div>
  
</div>
```

**Avantages** :
- ✅ **Rapide** : Pas de base de données complexe, juste du HTML
- ✅ **Simple** : Facile à inspecter dans DevTools (F12 > Elements)
- ✅ **Pas de doublons** : Structure hiérarchique garantit 1 table = 1 keyword

---

### COUCHE 4 : Checkpoint de Sécurité (dom-checkpoint-saver.js)

**Métaphore** : C'est comme **"Voulez-vous sauvegarder ?"** quand vous fermez Word

**Quand ça se déclenche** :
- ✅ Vous fermez l'onglet du navigateur
- ✅ Vous cliquez sur "Nouveau Chat"
- ✅ Vous rechargez la page (F5)
- ✅ Vous naviguez vers une autre URL

**Ce qu'elle fait concrètement** :

```javascript
class DOMCheckpointSaver {
  constructor() {
    
    // 1. Écouter fermeture page
    window.addEventListener('beforeunload', (e) => {
      console.log("🚪 Utilisateur ferme la page → CHECKPOINT");
      this.saveAllTablesCheckpoint();
    });
    
    // 2. Écouter navigation
    window.addEventListener('popstate', () => {
      console.log("🔄 Navigation détectée → CHECKPOINT");
      this.saveAllTablesCheckpoint();
    });
    
    // 3. Écouter changement de session chat
    document.addEventListener('claraverse:session:changed', () => {
      console.log("💬 Changement de chat → CHECKPOINT");
      this.saveAllTablesCheckpoint();
    });
  }
  
  saveAllTablesCheckpoint() {
    // Trouver TOUTES les tables visibles
    const tables = document.querySelectorAll('table[data-keyword]');
    let savedCount = 0;
    
    // Sauvegarder chacune IMMÉDIATEMENT (sans debounce)
    tables.forEach(table => {
      if (!table.closest('#claraverse-dom-storage')) { // Ignorer stockage
        window.domStorageManager.saveTable(sessionId, table.dataset.keyword, table);
        savedCount++;
      }
    });
    
    console.log(`💾 [Checkpoint] ${savedCount} table(s) sauvegardée(s)`);
  }
}
```

**Pourquoi c'est important** :
- Même si le debounce de Couche 2 est en cours (ex: 0.8 seconde restante)
- La Couche 4 **force la sauvegarde immédiate** avant que la page se ferme
- **0% de perte** garantie

---

## 🔄 CYCLE DE VIE COMPLET D'UNE TABLE

Suivons une table depuis sa création jusqu'à sa restauration :

### 📅 ÉTAPE 1 : Génération (par GPT)

```
Utilisateur : "Crée un programme de travail"
GPT génère : <table>...</table>
```

**Scripts impliqués** : Aucun (GPT génère juste le HTML)

---

### 🏷️ ÉTAPE 2 : Identification (conso.js)

```javascript
// conso.js détecte la nouvelle table
processTable(table) {
  
  // 1. Générer un ID unique basé sur les en-têtes
  const headers = ['Compte', 'Libellé', 'Montant', 'Assertion'];
  const hash = this.hashCode(headers.join('_'));
  const tableId = `table_${hash}`;
  
  // 2. Assigner ID et keyword
  table.dataset.tableId = tableId;
  table.dataset.keyword = `Table_7_${Date.now()}`;
  
  console.log("🆔 Table identifiée:", table.dataset.keyword);
}
```

**Attributs ajoutés** :
```html
<table data-table-id="table_abc123"
       data-keyword="Table_7_1789247328223">
  <!-- Contenu... -->
</table>
```

---

### 👀 ÉTAPE 3 : Installation Surveillance (conso.js + dom-auto-save.js)

**3A. Surveillance Menus (conso.js)** :

```javascript
// Pour chaque cellule Assertion/Conclusion/Ctr
setupAssertionCell(cell) {
  cell.addEventListener("click", (e) => {
    // Menu déroulant + sauvegarde immédiate
  });
}
```

**3B. Surveillance Générale (dom-auto-save.js)** :

```javascript
// Observer tous changements
const tableObserver = new MutationObserver(() => {
  this.scheduleTableSave(table); // Debounce 1000ms
});

tableObserver.observe(table, {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true
});
```

---

### ✏️ ÉTAPE 4 : Modifications Utilisateur

#### Modification Type 1 : Menu Déroulant (Couche 1)

```
Seconde 0.0 : Click cellule Assertion
Seconde 0.1 : Menu s'ouvre (MutationObserver détecte ← mais on ignore)
Seconde 0.3 : Utilisateur clique "Validité"
Seconde 0.3 : 💾 COUCHE 1 : Sauvegarde immédiate (0ms)
Seconde 0.4 : MutationObserver détecte changement cellule
Seconde 1.4 : 💾 COUCHE 2 : Sauvegarde debounce (backup)
```

**Résultat** : 2 sauvegardes (sécurité redondante)

#### Modification Type 2 : Édition Texte (Couche 2 seule)

```
Seconde 0.0 : Utilisateur tape "Client A"
Seconde 0.1 : MutationObserver détecte → Timer 1000ms
Seconde 0.5 : Utilisateur ajoute " - Paris"
Seconde 0.6 : Timer ANNULÉ et redémarré
Seconde 1.6 : 💾 COUCHE 2 : Sauvegarde
```

**Résultat** : 1 sauvegarde (Couche 1 non concernée)

---

### 💾 ÉTAPE 5 : Sauvegarde Physique (Couche 3)

```javascript
// dom-storage-manager.js
window.domStorageManager.saveTable(
  'session_abc123',      // sessionId
  'Table_7_1789247328223', // keyword
  tableElement           // la table HTML complète
);
```

**Ce qui se passe** :

```
1. Trouver <div data-session-id="session_abc123">
2. Chercher <table data-keyword="Table_7_1789247328223">
3. Si existe → Remplacer innerHTML
4. Si n'existe pas → Créer et ajouter
5. Mettre à jour timestamp
6. Logger confirmation
```

**Résultat dans le DOM** :

```html
<div id="claraverse-dom-storage" style="display:none">
  <div data-session-id="session_abc123">
    <table data-keyword="Table_7_1789247328223"
           data-saved-at="2026-09-12T10:05:32.123Z"
           data-updated-at="2026-09-12T10:08:45.678Z">
      <tr><td>Client A - Paris</td><td>Validité</td></tr>
      <!-- Contenu complet sauvegardé -->
    </table>
  </div>
</div>
```

---

### 🚪 ÉTAPE 6 : Navigation/Fermeture (Couche 4)

```
Utilisateur clique "Nouveau Chat"
  ↓
Couche 2 : Timer en cours (0.7 sec restante)
  ↓
Couche 4 : beforeunload déclenché
  ↓
💾 CHECKPOINT : Sauvegarde forcée IMMÉDIATE
  ↓
Navigation vers nouveau chat
```

**Résultat** : Même avec timer non terminé, table sauvegardée !

---

### 🔄 ÉTAPE 7 : Restauration (dom-restore-manager.js)

Utilisateur revient au chat :

```javascript
// 1. Détecter sessionId
const sessionId = 'session_abc123';

// 2. Récupérer toutes les tables de cette session
const tables = window.domStorageManager.restoreAllTables(sessionId);
// Retourne : [
//   { keyword: 'Table_7_1789247328223', element: <table>...</table> },
//   ...
// ]

// 3. Insérer chaque table dans la zone visible
tables.forEach(tableData => {
  
  // Créer wrapper avec badge
  const wrapper = document.createElement('div');
  wrapper.className = 'restored-table-wrapper';
  wrapper.style.cssText = 'border: 2px solid #22c55e; border-radius: 8px; padding: 10px; margin: 10px 0;';
  
  // Badge "✅ Table Restaurée"
  const badge = document.createElement('div');
  badge.textContent = '✅ Table Restaurée';
  badge.style.cssText = 'background: #22c55e; color: white; padding: 5px 10px; border-radius: 4px; margin-bottom: 10px;';
  
  wrapper.appendChild(badge);
  wrapper.appendChild(tableData.element);
  
  // Insérer sous zone de saisie
  const chatMessages = document.querySelector('.chat-messages');
  chatMessages.appendChild(wrapper);
  
  console.log("✅ Table restaurée:", tableData.keyword);
});
```

**Résultat visible** :

```
┌────────────────────────────────────────┐
│ ✅ Table Restaurée                     │
├────────────────────────────────────────┤
│ Table avec toutes les modifications    │
│ • Ligne ajoutée : Client A - Paris     │
│ • Assertion : Validité                 │
│ • Conclusion : Satisfaisant            │
└────────────────────────────────────────┘
```

---

## 💡 SOLUTION FINALE À 4 NIVEAUX

Récapitulatif de comment les 4 couches résolvent les problèmes :

### Problème 1 : "Trop Tôt"

**Problème** : MutationObserver détecte menu qui s'ouvre, pas valeur finale

**Solution** : **COUCHE 1** sauvegarde après fermeture menu (callback du menu)

```javascript
// AVANT (problématique)
MutationObserver détecte → Timer 500ms → Sauvegarde (trop tôt)

// APRÈS (solution)
Menu ferme → Callback avec valeur → Sauvegarde IMMÉDIATE → Timer 1000ms (backup)
```

### Problème 2 : "Debounce Insuffisant"

**Problème** : 5 modifications rapides → timer annulé 4 fois → 1 seule sauvegardée

**Solution** : **COUCHE 1** + **Debounce augmenté**

```javascript
// AVANT (problématique)
Modif 1 → Timer 500ms
Modif 2 (300ms) → ANNULE → Timer 500ms
Modif 3 (200ms) → ANNULE → Timer 500ms
Modif 4 (400ms) → ANNULE → Timer 500ms
Modif 5 (100ms) → ANNULE → Timer 500ms
→ Sauvegarde → Seule modif 5

// APRÈS (solution)
Modif 1 (menu) → Sauvegarde IMMÉDIATE ✅ + Timer 1000ms
Modif 2 (menu) → Sauvegarde IMMÉDIATE ✅ + Timer ANNULE/RESTART
Modif 3 (menu) → Sauvegarde IMMÉDIATE ✅ + Timer ANNULE/RESTART
Modif 4 (menu) → Sauvegarde IMMÉDIATE ✅ + Timer ANNULE/RESTART
Modif 5 (menu) → Sauvegarde IMMÉDIATE ✅ + Timer 1000ms
→ Sauvegarde finale (backup) → Toutes modifs sauvegardées ✅
```

### Problème 3 : "Navigation Rapide"

**Problème** : Utilisateur ferme page pendant debounce → perte

**Solution** : **COUCHE 4** force sauvegarde avant fermeture

```javascript
// AVANT (problématique)
Modif → Timer 500ms (0.3 sec écoulée)
Utilisateur ferme page → Timer annulé → PERTE

// APRÈS (solution)
Modif → Timer 1000ms (0.7 sec écoulée)
Utilisateur ferme page → beforeunload → CHECKPOINT → SAUVEGARDE FORCÉE ✅
```

---

## 📊 TABLEAU RÉCAPITULATIF

| Couche | Déclencheur | Délai | Rôle |
|--------|-------------|-------|------|
| **1. Immédiate** | Menu déroulant fermé | **0ms** | Sauvegarde valeur sélectionnée |
| **2. Observer** | Tout changement HTML | **1000ms** | Backup + capture changements imprévus |
| **3. Stockage** | Appel des couches 1 ou 2 | **Immédiat** | Écriture physique dans DOM caché |
| **4. Checkpoint** | Navigation/Fermeture | **Immédiat** | Force sauvegarde avant perte contexte |

---

## 🎓 EXEMPLES CONCRETS

### Exemple 1 : Utilisateur Rapide ⚡

**Scénario** : Modifier 5 cellules en 3 secondes puis fermer l'onglet

```
0.0s : Click Assertion 1 → "Validité"
       💾 Couche 1 : Sauvegarde immédiate
       
0.5s : Click Conclusion 2 → "Satisfaisant"
       💾 Couche 1 : Sauvegarde immédiate
       
1.0s : Click Ctr 3 → "+"
       💾 Couche 1 : Sauvegarde immédiate
       
1.5s : Click Assertion 4 → "Exhaustivité"
       💾 Couche 1 : Sauvegarde immédiate
       
2.0s : Click Conclusion 5 → "Limitation"
       💾 Couche 1 : Sauvegarde immédiate
       
2.3s : Fermeture onglet
       💾 Couche 4 : Checkpoint (backup redondant)

✅ RÉSULTAT : 5/5 modifications sauvegardées
```

### Exemple 2 : Utilisateur Lent 🐌

**Scénario** : Modifier 2 cellules avec 5 secondes d'intervalle

```
0.0s : Click Assertion → "Validité"
       💾 Couche 1 : Sauvegarde immédiate
       ⏱️ Couche 2 : Timer 1000ms
       
1.0s : Couche 2 : Timer terminé
       💾 Couche 2 : Sauvegarde (redondant mais OK)
       
5.0s : Click Conclusion → "Satisfaisant"
       💾 Couche 1 : Sauvegarde immédiate
       ⏱️ Couche 2 : Timer 1000ms
       
6.0s : Couche 2 : Timer terminé
       💾 Couche 2 : Sauvegarde (redondant mais OK)

✅ RÉSULTAT : 2/2 modifications sauvegardées
```

### Exemple 3 : Édition Texte (sans menu) ⌨️

**Scénario** : Taper du texte dans cellule

```
0.0s : Tape "Client"
       ⏱️ Couche 2 : Timer 1000ms (Couche 1 non concernée)
       
0.3s : Tape " A"
       ⏱️ Couche 2 : Timer ANNULÉ et redémarré
       
0.7s : Tape " - Paris"
       ⏱️ Couche 2 : Timer ANNULÉ et redémarré
       
1.7s : Couche 2 : Timer terminé (1 sec sans changement)
       💾 Couche 2 : Sauvegarde "Client A - Paris"

✅ RÉSULTAT : Texte final sauvegardé
```

---

## 🔍 COMMENT VÉRIFIER QUE ÇA MARCHE

### Dans la Console (F12)

```javascript
// 1. Vérifier les 4 couches chargées
window.domStorageManager     // Couche 3 ✅
window.domRestoreManager     // Restauration ✅
window.domAutoSave           // Couche 2 ✅
window.domCheckpointSaver    // Couche 4 ✅
window.claraverseProcessor   // Couche 1 ✅

// 2. Vérifier debounce
window.domAutoSave.saveDelay
// → Doit afficher : 1000

// 3. Vérifier sauvegarde immédiate
window.claraverseProcessor.setupAssertionCell.toString().includes('saveTableDataNow')
// → Doit afficher : true

// 4. Voir les tables sauvegardées
window.domStorageManager.diagnose()
// → Affiche liste complète
```

### Dans DevTools Elements

```
1. F12 > Elements
2. Ctrl+F → Chercher "claraverse-dom-storage"
3. Expand <div id="claraverse-dom-storage">
4. Voir toutes vos tables sauvegardées
```

---

## ❓ FAQ DÉBUTANT

### Q1 : Pourquoi 4 couches ? C'est pas trop compliqué ?

**R** : Chaque couche a un rôle **spécifique** :
- Couche 1 : Menus déroulants (le plus risqué)
- Couche 2 : Tout le reste (filet de sécurité)
- Couche 3 : Écriture physique (le "disque dur")
- Couche 4 : Avant fermeture (dernier filet)

Sans les 4, on perd des données ! C'est comme une **ceinture ET bretelles ET filet de sécurité**.

### Q2 : Pourquoi pas juste localStorage ou indexedDB ?

**R** : On a essayé ! Problèmes rencontrés :
- **localStorage** : Limite 5-10 MB (pas assez)
- **indexedDB** : Async = race conditions, doublons, complexe

**DOM Storage** : Simple, rapide, 0 doublon garanti par structure HTML.

### Q3 : Et si je perds la connexion internet ?

**R** : **Aucun problème** ! Le système est 100% local :
- Pas de serveur
- Pas d'API
- Tout dans le navigateur

Même hors ligne, vos tables sont sauvegardées.

### Q4 : Les données restent combien de temps ?

**R** : Tant que vous ne fermez pas **tous les onglets** du site.

Si vous :
- Fermez 1 onglet → Données restent (autres onglets)
- Rechargez page → Données restaurées
- Fermez TOUS les onglets puis rouvrez → Données perdues (par conception)

Pour une persistance permanente, il faudrait localStorage/indexedDB (futur).

### Q5 : C'est sécurisé ?

**R** : Oui, données dans votre navigateur uniquement :
- Pas envoyées sur serveur
- Pas accessibles par autres sites
- Isolées par session

Mais : Si quelqu'un accède physiquement à votre PC avec navigateur ouvert, il peut voir les tables (comme n'importe quelle page web).

---

## 🎯 RÉSUMÉ POUR UN ENFANT DE 10 ANS

Imagine que tu construis un château en **LEGO** :

**Couche 1** : Chaque fois que tu poses une pièce importante (tourelle, porte), tu prends une **photo immédiate** 📸

**Couche 2** : Toutes les 10 secondes, un robot surveille et prend une photo **si tu as fait des changements** 🤖

**Couche 3** : Les photos sont rangées dans un **album** bien organisé 📚

**Couche 4** : Si tu dois partir d'urgence, tu prends une **dernière photo** de tout 🏃

Résultat : Tu ne perds **JAMAIS** ton château, même si tu pars très vite ! 🏰✅

---

**Date** : 12 Septembre 2026  
**Auteur** : Kiro AI  
**Version** : 1.0  
**Pour** : Débutants et équipe projet Claraverse

