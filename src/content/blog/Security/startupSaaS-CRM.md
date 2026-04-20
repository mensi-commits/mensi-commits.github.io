---
title: 'Start-Up SaaS CRM'
description: 'Start-Up SaaS CRM'
date: 2026-04-20T00:00:00+01:00
tags: ['CP', 'competitive programming']
authors: ['mensi']
image: src/content/blog/Security/samurai-sunset.jpg
draft: false
maths: true
---

# 1) Identification

## A) Acteurs (Subjects)

### 1) Acteurs internes (employés SaaS)

- **Développeur**
- **Support client**
- **Commercial**
- **Finance**
- **Direction produit / Admin plateforme**

### 2) Acteurs externes (clients SaaS)

- **Admin entreprise cliente**
- **Manager (client)**
- **Utilisateur standard (client)**

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
