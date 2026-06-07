<div align="center">
  <img src="docs/logo_FPK.png" alt="HubFPK Logo" width="150" />
  <h1>HubFPK</h1>
  <p><strong>Une plateforme communautaire Full-Stack pour la Faculté Polydisciplinaire de Khouribga (FPK)</strong></p>

  [![Vercel Deployment](https://img.shields.io/badge/Déployé_sur-Vercel-black?logo=vercel)](#)
  [![React](https://img.shields.io/badge/React-19-blue?logo=react)](#)
  [![Express](https://img.shields.io/badge/Express-5.2-lightgrey?logo=express)](#)
  [![Supabase](https://img.shields.io/badge/Supabase-Database_&_Auth-3ECF8E?logo=supabase)](#)

  <br><br>

  <!-- Big Flashy Buttons -->
  <a href="https://userv-alt.github.io/HubFPK/" target="_blank">
    <img src="https://img.shields.io/badge/📖_Cliquez_pour_accéder_aux_explications_du_projet-1a5c3a?style=for-the-badge&logo=readme&logoColor=white" alt="Explications du projet" />
  </a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://hub-fpk-hw9z.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Accéder_à_l'application_Live-FBBF24?style=for-the-badge&logo=vercel&logoColor=black" alt="Application Live" />
  </a>

</div>

<br />

HubFPK est un forum communautaire moderne et en temps réel, conçu spécifiquement pour les étudiants de la Faculté Polydisciplinaire de Khouribga (FPK). Inspiré par des plateformes comme Reddit et Stack Overflow, il offre un espace structuré permettant aux étudiants de partager des ressources, poser des questions et collaborer à travers les différents départements académiques.

---

## ✨ Fonctionnalités Principales

- **Départements Académiques Structurés :** Les discussions sont organisées par catégories (Informatique, Mathématiques, Économie, Sciences, Langues, Vie étudiante, Annonces).
- **Texte Riche Markdown :** Rédigez des publications complètes en utilisant la syntaxe Markdown avec un aperçu en temps réel, idéal pour les blocs de code et les formules mathématiques.
- **Votes & Karma (Style Reddit) :** Votez pour ou contre (upvote/downvote) les sujets et les réponses. Les utilisateurs gagnent de la réputation (Karma) pour leurs contributions utiles.
- **Interactions en Temps Réel :** Grâce à Supabase Realtime (WebSockets), les nouvelles publications, les votes et les notifications s'affichent instantanément sans avoir besoin de rafraîchir la page.
- **Sécurité RLS (Row Level Security) :** Les opérations de la base de données sont strictement sécurisées au niveau de PostgreSQL, garantissant que les utilisateurs ne peuvent modifier que leurs propres données.
- **Authentification Sécurisée :** Système complet d'inscription et de connexion avec confirmation par e-mail géré par Supabase Auth.

## 🏗️ Architecture & Stack Technique

HubFPK repose sur une architecture Full-Stack découplée :

### Frontend
- **Framework :** React (v19) + Vite
- **Style :** TailwindCSS pour une interface utilisateur moderne et réactive
- **Icônes & Contenu :** Lucide Icons, `react-markdown` pour le rendu des publications
- **État & Routage :** React Router DOM

### Backend API
- **Framework :** Node.js avec Express.js
- **Architecture :** API REST exposant des points de terminaison pour les discussions, réponses, catégories, votes, profils et notifications
- **Sécurité :** Politiques CORS strictes limitées à l'origine du frontend

### Base de Données & Auth
- **Plateforme :** Supabase (PostgreSQL)
- **Fonctionnalités :** Triggers (création automatique de profils, notifications automatiques), politiques Row Level Security (RLS), Canaux en Temps Réel (Realtime)

---

## 🚀 Démarrage Rapide

Suivez ces étapes pour exécuter HubFPK localement sur votre machine.

### Prérequis
- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- Un compte et un projet [Supabase](https://supabase.com/)

### 1. Configuration de la Base de Données
1. Créez un nouveau projet sur Supabase.
2. Allez dans l'éditeur SQL et exécutez l'intégralité du contenu du fichier [`setup.sql`](./setup.sql). Cela va :
   - Créer toutes les tables nécessaires (`profiles`, `categories`, `threads`, `posts`, `votes`, `notifications`).
   - Insérer les départements par défaut.
   - Configurer les politiques de sécurité (RLS).
   - Créer les déclencheurs (triggers) et fonctions de base de données.

### 2. Configuration du Backend
1. Naviguez vers le dossier backend :
   ```bash
   cd forum-backend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` à la racine de `forum-backend` :
   ```env
   PORT=4000
   FRONTEND_URL=http://localhost:5173
   SUPABASE_URL=votre_url_projet_supabase
   SUPABASE_ANON_KEY=votre_cle_anon_supabase
   ```
4. Démarrez le serveur backend :
   ```bash
   npm run dev
   ```

### 3. Configuration du Frontend
1. Ouvrez un nouveau terminal et naviguez vers le dossier frontend :
   ```bash
   cd forum-frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` à la racine de `forum-frontend` :
   ```env
   VITE_SUPABASE_URL=votre_url_projet_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   VITE_API_URL=http://localhost:4000/api
   ```
4. Démarrez le serveur de développement frontend :
   ```bash
   npm run dev
   ```

Vous pouvez maintenant consulter l'application sur `http://localhost:5173` !

---

## 📁 Structure du Projet

```text
HubFPK/
├── forum-backend/           # API Express.js
│   ├── routes/              # Points de terminaison (discussions, votes, etc.)
│   └── index.js             # Point d'entrée du serveur Express
├── forum-frontend/          # Application React + Vite
│   ├── src/
│   │   ├── components/      # Composants UI réutilisables (Navbar, etc.)
│   │   ├── pages/           # Vues principales (Accueil, Discussion, Profil, etc.)
│   │   ├── App.jsx          # Configuration du routage React
│   │   └── supabaseClient.js# Initialisation de Supabase
│   └── tailwind.config.js   # Configuration de Tailwind
├── docs/                    # Documentation et site web de présentation
├── setup.sql                # Schéma de base de données, politiques RLS et triggers
└── README.md                # Ce fichier
```

---

## 👨‍💻 Équipe & Contributeurs

Ce projet a été réalisé dans le cadre du module **Citoyenneté et Initiation** pour l'année universitaire 2025-2026, sous l'encadrement de **M. CHAKRAOUI Mohamed**.

- **HABYBY Zahira**
- **EL MAHI Nadia**
- **EL HOSSI Fatima Zahra**
- **ANAM Ayoub**

---

<div align="center">
  <i>Si vous trouvez ce projet utile, n'hésitez pas à lui donner une ⭐ !</i>
</div>
