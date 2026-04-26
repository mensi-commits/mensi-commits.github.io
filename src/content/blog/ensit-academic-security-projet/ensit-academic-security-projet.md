---
title: 'Données & Entreprises : Scénario de fonctionnement (SaaS CRM)'
description: 'Données & Entreprises : Scénario de fonctionnement (SaaS CRM)'
date: 2026-04-26T12:00:00+01:00
tags: ['SaaS CRM']
authors: ['mensi']
image: ../assets/ensit-academic-security-projet/1.png
draft: false
maths: true
---

# 1) Identification

## A) Acteurs (Subjects)

### 1) Acteurs internes (employés SaaS)

- **Développeur**
- **Support client**
- **Commercial**
- **Responsable grands comptes (Key Account Manager)**
- **Finance**
- **Direction produit / Admin plateforme**
- **Administrateur sécurité (Security Officer / IAM Admin)**

### 2) Acteurs externes (clients SaaS)

- **Admin entreprise cliente**
- **Manager (client)**
- **Utilisateur standard (client)**
- **Auditeur / compliance (client)**

### 3) Acteurs système

- **Système CRM (services backend)**
- **Moteur de reporting / analytics**
- **API externe / intégrations**
- **Processus automatique de sauvegarde / audit**

---

## B) Équipes (Organizational Units)

### Équipes internes

- **Développement**
- **Support client**
- **Équipe commerciale**
- **Responsables grands comptes**
- **Finance**
- **Direction produit**
- **Sécurité / IT (IAM)**

### Équipes côté client

- **Entreprise cliente A**
- **Entreprise cliente B**
- etc. (multi-tenant)

---

## C) Ressources / Objets (Objects)

Les données sensibles du CRM :

- **Comptes utilisateurs**
- **Prospects**
- **Clients**
- **Opportunités commerciales**
- **Tickets support**
- **Historique des appels**
- **Contrats**
- **Factures / paiements**
- **Tableaux de bord KPI**
- **Logs audit**
- **Paramètres d’abonnement**
- **Données régionales (pays, zone commerciale)**

---

# 2) Opérations (Actions)

Les opérations principales qu’un acteur peut faire :

### CRUD classique

- **Créer**
- **Lire**
- **Modifier**
- **Supprimer**

### Opérations métiers spécifiques

- Assigner un prospect / opportunité à un commercial
- Transférer un client à un autre commercial
- Consulter pipeline commercial
- Modifier contrat
- Générer facture / export financier
- Ouvrir / traiter / fermer un ticket support
- Exporter des données (CSV / PDF)
- Accéder aux dashboards performance
- Gérer les utilisateurs (création, reset password, désactivation)
- Accéder aux logs d’audit
- Déléguer temporairement un portefeuille client

---

# 3) Règles d’accès (Access Rules)

## Règle 1 : Cloisonnement Multi-tenant (obligatoire)

📌 Un utilisateur ne peut accéder qu’aux données de son entreprise.

- Client A **ne voit jamais** client B
- même si l’utilisateur a un rôle élevé

➡️ Ceci ressemble à une **MAC (Mandatory Access Control)** imposée par le système.

---

## Règle 2 : RBAC (Role-Based Access Control)

Les droits dépendent du rôle :

### Commercial

- accès prospects/opportunités **assignés**
- accès limité contrats (lecture partielle)

### Responsable grands comptes

- accès large aux contrats stratégiques
- accès multi-régions sur certains comptes

### Support

- accès tickets + historique incidents
- accès limité aux infos financières

### Finance

- accès complet aux contrats + factures
- accès lecture aux clients

### Dev

- accès à environnement test, pas prod (normalement)
- accès logs techniques mais pas données clients en clair

### Admin plateforme / direction produit

- accès global (mais audit obligatoire)

---

## Règle 3 : ABAC (Attribute-Based Access Control)

Accès dépend de conditions :

Attributs possibles :

- **pays du client**
- **région commerciale**
- **type d’abonnement (basic / premium / enterprise)**
- **secteur réglementé (banque, santé, défense)**
- **statut du contrat (actif / expiré)**
- **heure / localisation de connexion**
- **niveau de clearance interne**

Exemple :

- Support Tunisia ne peut pas accéder aux données d’un client EU si la loi l’interdit.

---

## Règle 4 : Least Privilege (principe sécurité)

Chaque employé n’a que ce dont il a besoin.

Exemple :

- Support n’a pas accès au module Finance.
- Commercial ne voit pas tous les contrats, seulement ceux liés à ses comptes.

---

## Règle 5 : Délégation temporaire (DAC)

Un commercial peut partager un client avec un collègue pendant 7 jours.

➡️ Ça ressemble à **DAC (Discretionary Access Control)** :
le propriétaire du portefeuille peut donner un droit temporaire.

Conditions :

- durée limitée
- audit log obligatoire
- révocation automatique

---

## Règle 6 : Séparation des tâches (SoD)

Éviter la fraude :

- Commercial ne peut pas **valider** un contrat + **facturer**
- Finance valide et facture
- Support ne modifie pas les prix

➡️ Très important dans les CRM SaaS.

---

## Règle 7 : Traçabilité (Auditabilité)

Toute action sensible doit être loggée :

- lecture contrat
- export données
- suppression
- modification prix

---

# 4) Niveaux de sécurité (Security Levels)

Tu peux définir des niveaux type **Bell-LaPadula / Lampson**.

### Niveau 0 : Public

- documentation marketing
- pages publiques

### Niveau 1 : Interne SaaS (Internal)

- infos produit internes
- statistiques générales non sensibles

### Niveau 2 : Client Standard (Confidential)

- prospects, opportunités, tickets
- données usuelles CRM

### Niveau 3 : Client Sensible (Restricted)

- contrats
- informations stratégiques (pipeline, KPI détaillés)

### Niveau 4 : Critique / Réglementé (Highly Restricted)

- données financières (paiements, factures)
- clients secteurs réglementés
- audits légaux

---

# 5) Lien avec les modèles de contrôle d’accès

## Bell-LaPadula (Confidentialité)

Principe :

- **No Read Up** (pas lire plus haut)
- **No Write Down** (pas écrire vers plus bas)

Application CRM :

- Support niveau 2 ne peut pas lire contrats niveau 4.
- Finance niveau 4 peut lire tout.

---

## Biba (Intégrité)

Principe :

- empêcher les utilisateurs peu fiables de modifier des données critiques

Application :

- Commercial ne peut pas modifier les factures.
- Support ne peut pas modifier contrats.

---

## DAC

- délégation temporaire entre commerciaux
- partage de portefeuille

---

## MAC

- séparation multi-tenant obligatoire
- règles pays/secteur imposées (non négociables)

---

## Lampson Access Matrix

Tu peux représenter ça sous forme matrice :

**Sujet (acteur)** vs **Objet (ressource)** avec droits (R,W,D,Export).

Exemple :

- Support → Ticket (R/W)
- Support → Contrat (R partiel)
- Finance → Contrat (R/W)
- Commercial → Opportunité (R/W)

---

# Résumé clair pour ton rapport

### Acteurs

Internes (support, dev, finance, commerciaux, KAM, admin) + clients + système.

### Opérations

CRUD + actions métiers (assigner, exporter, déléguer, facturer, clôturer ticket).

### Équipes

Support, Sales, KAM, Finance, Product, Dev, Security + entreprises clientes.

### Règles d’accès

- cloisonnement tenant (MAC)
- rôles (RBAC)
- contexte pays/abonnement/secteur (ABAC)
- délégation temporaire (DAC)
- séparation des tâches + audit

### Niveaux sécurité

Public / Interne / Confidential / Restricted / Highly Restricted.

# 2) Conception du système + Justification des choix (CRM SaaS)

Dans cette partie, on décrit **l’architecture de sécurité** du CRM SaaS et on justifie quels modèles (DAC, MAC, RBAC, Bell-LaPadula…) sont adaptés ou non.

---

# 2.1 Conception globale du système (Security Design)

## A) Architecture fonctionnelle (vue logique)

Un CRM SaaS multi-tenant contient généralement :

### 1) Frontend (Web / Mobile)

- Interface utilisateur (React, Angular…)
- Authentification via token (JWT / OAuth2)

### 2) API Gateway

- point d’entrée unique
- applique rate-limiting, WAF, contrôle IP

### 3) Backend Services (Microservices ou monolithe)

Services typiques :

- Service Utilisateurs & Auth (IAM)
- Service CRM (leads, deals, contacts)
- Service Finance (factures, paiements)
- Service Support (tickets)
- Service Reporting (KPI, dashboards)
- Service Audit (logs, traçabilité)

### 4) Base de données (multi-tenant)

Deux choix :

- **DB partagée + tenant_id** (plus économique)
- **DB séparée par tenant** (plus sécurisé mais coûteux)

### 5) Stockage fichiers

- contrats PDF, devis, pièces jointes
- stockage chiffré (S3-like)

### 6) Logging & Monitoring

- logs applicatifs
- logs sécurité (auth, export, suppression)
- alertes automatiques (SIEM)

---

## B) Conception sécurité (contrôles obligatoires)

### 1) Authentification (Authentication)

- login + mot de passe
- MFA obligatoire pour admins
- OAuth2 / SSO pour entreprises grandes (Azure AD)

### 2) Autorisation (Authorization)

On combine plusieurs modèles :

📌 **RBAC + ABAC + MAC tenant isolation**

- RBAC : droits par rôle
- ABAC : restrictions contextuelles (pays, région, abonnement…)
- MAC : cloisonnement multi-tenant imposé

### 3) Protection des données

- chiffrement TLS (en transit)
- chiffrement AES (au repos)
- hash passwords (bcrypt/argon2)
- gestion secrets via vault

### 4) Audit & conformité

- logs immuables (WORM storage possible)
- journalisation des exports et suppressions
- détection anomalie (ex : 1000 exports en 1h)

### 5) Séparation des tâches (SoD)

- validation devis par manager
- facturation uniquement finance
- suppression client uniquement tenant admin

---

# 2.2 Choix des modèles de sécurité (justifications)

Le CRM SaaS est un système complexe. Aucun modèle seul n’est suffisant, donc on adopte une **approche hybride**.

---

## A) Pourquoi RBAC est le modèle principal

### RBAC (Role-Based Access Control)

**Justification :**

- CRM = organisation basée sur rôles (Sales, Support, Finance)
- facile à administrer (tenant admin)
- scalable (1000 utilisateurs)

**Exemples concrets :**

- SalesRep : gérer leads assignés
- SupportAgent : gérer tickets
- Finance : gérer factures
- Manager : accès reporting

📌 RBAC est le meilleur modèle de base pour un SaaS CRM.

---

## B) Pourquoi ABAC est nécessaire en complément

RBAC seul ne suffit pas car il manque les contraintes contextuelles.

### ABAC (Attribute-Based Access Control)

**Justification :**

- SaaS multi-tenant = règles dépendantes de pays, abonnement, secteur
- besoin de contrôler selon contexte (RGPD, restrictions régionales)

**Exemples :**

- Support Tunisia ne peut pas accéder à clients EU
- export autorisé uniquement si abonnement = Enterprise
- accès autorisé seulement pendant heures de travail

📌 ABAC est indispensable pour des règles réalistes et fines.

---

## C) Pourquoi MAC est obligatoire pour l’isolation multi-tenant

### MAC (Mandatory Access Control)

**Justification :**

- l’isolation entre entreprises ne doit jamais dépendre des utilisateurs
- la politique doit être imposée par le système

**Exemple :**

- Tenant A ne peut jamais lire Tenant B même si un admin tente de le permettre.

📌 Multi-tenant cloisonnement = MAC obligatoire.

---

## D) Pourquoi DAC est utile mais limité

### DAC (Discretionary Access Control)

**Justification :**

- utile pour partager temporairement un portefeuille client
- correspond au besoin business (collaboration)

**Risque :**

- propagation incontrôlée des droits
- fuite interne volontaire ou accidentelle

📌 DAC est acceptable seulement avec :

- expiration automatique
- audit logs
- approbation manager (optionnel)

---

## E) Bell-LaPadula pour la confidentialité (classification des données)

### Bell-LaPadula (Confidentiality Model)

**Justification :**

- CRM contient des niveaux de données (contrats, paiements, logs)
- protège contre fuite d’infos sensibles

**Application :**

- Support ne lit pas données financières
- Finance peut lire plus haut
- pas d’écriture d’infos financières dans zones publiques

📌 Très adapté aux données CRM classifiées.

---

## F) Biba pour l’intégrité

### Biba (Integrity Model)

**Justification :**

- CRM contient données critiques (factures, contrats signés)
- empêcher modification frauduleuse

**Application :**

- SalesRep ne modifie pas facture
- Support ne modifie pas contrat
- seuls acteurs "trusted" peuvent écrire dans données critiques

📌 Adapté aux modules Finance / Contrats.

---

## G) Lampson Access Matrix pour la modélisation formelle

### Lampson Access Control Matrix

**Justification :**

- permet de représenter formellement droits Sujet/Objet
- utile pour rapport académique
- base théorique de RBAC

📌 Très adapté pour documenter le système.

---

## H) Clark-Wilson (très bon pour finance)

### Clark-Wilson (Integrity Model)

**Justification :**

- modèle orienté entreprise et transactions
- impose séparation des tâches + validation

**Application :**

- une facture passe par workflow : création → validation → paiement
- empêche fraude

📌 Excellent pour CRM SaaS (facturation + workflow).

---

# 2.3 Tableau comparatif des modèles (Adapté / Non adapté)

Voici le tableau demandé pour ton rapport.

| Modèle                          | Adapté au CRM SaaS ?          | Pourquoi (résumé clair)                                                                           |
| ------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------- |
| **RBAC**                        | ✅ Oui (très adapté)          | CRM basé sur rôles métiers (Sales/Support/Finance), facile à gérer et scalable.                   |
| **ABAC**                        | ✅ Oui (nécessaire)           | Permet règles contextuelles (pays, abonnement, ownership, horaires, RGPD).                        |
| **DAC**                         | ⚠️ Partiellement              | Utile pour délégation temporaire (partage client), mais risque de propagation des droits.         |
| **MAC**                         | ✅ Oui (obligatoire)          | Isolation multi-tenant imposée par le système, non négociable.                                    |
| **Bell-LaPadula**               | ✅ Oui                        | Très bon pour la confidentialité (contrats/factures vs tickets).                                  |
| **Biba**                        | ✅ Oui                        | Protège l’intégrité des données critiques (factures, contrats signés).                            |
| **Lampson (Access Matrix)**     | ✅ Oui                        | Modèle formel excellent pour représenter permissions, base théorique de RBAC.                     |
| **Clark-Wilson**                | ✅ Oui (fortement recommandé) | Modèle idéal pour workflows business : validation facture, séparation des tâches, audit.          |
| **Chinese Wall (Brewer-Nash)**  | ⚠️ Peu adapté                 | Utile pour conflits d’intérêts (consultants), mais CRM SaaS standard n’en a pas toujours besoin.  |
| **Take-Grant**                  | ❌ Peu adapté                 | Modèle théorique de propagation de droits, rarement utilisé directement en SaaS.                  |
| **HRU (Harrison-Ruzzo-Ullman)** | ❌ Non adapté (pratique)      | Utile théoriquement pour analyser fuite de droits, mais trop complexe pour implémentation réelle. |
| **Discretionary ACL classique** | ⚠️ Partiellement              | Peut gérer partage interne mais ne suffit pas pour multi-tenant.                                  |
| **Capability-based Security**   | ⚠️ Rare                       | Possible via tokens (API), mais difficile à gérer globalement sans RBAC.                          |

---

# 2.4 Choix final proposé (Approche hybride)

Pour ton CRM SaaS, la meilleure conception est :

### Modèle principal :

✅ **RBAC** (rôles métiers)

### Complément indispensable :

✅ **ABAC** (contexte : pays, abonnement, région, ownership)

### Règle non négociable :

✅ **MAC** (tenant isolation)

### Contrôle confidentialité :

✅ **Bell-LaPadula** (classification : confidential / restricted)

### Contrôle intégrité :

✅ **Biba + Clark-Wilson** (factures, contrats, validation workflow)

### Documentation académique :

✅ **Lampson Matrix** (tableau sujet/objet/droits)

---

# Conclusion (à mettre dans ton rapport)

Le CRM SaaS nécessite une politique de sécurité hybride car :

- RBAC seul est trop général
- ABAC est nécessaire pour règles légales et contextuelles
- MAC est obligatoire pour l’isolation multi-tenant
- Bell-LaPadula protège la confidentialité
- Biba et Clark-Wilson protègent l’intégrité et empêchent la fraude
- Lampson fournit une représentation formelle des permissions

---

Si tu veux, je peux aussi te faire une **architecture diagramme textuelle** + une **matrice Lampson complète en tableau** (rôles × objets × droits) pour que ton rapport soit très solide.
