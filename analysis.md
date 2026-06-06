# HubFPK — Analyse Complète du Projet

> **HubFPK** est une plateforme communautaire étudiante pour la Faculté Polydisciplinaire de Khouribga (FPK), Maroc.  
> Elle permet aux étudiants de discuter, poser des questions, partager des ressources et rester informés.

---

## 📁 1. Structure Générale du Projet

```
HubFPK/
├── forum-backend/          # API REST Node.js/Express
│   ├── index.js            # Point d'entrée du serveur
│   ├── routes/             # 7 modules de routes
│   │   ├── categories.js
│   │   ├── threads.js
│   │   ├── posts.js
│   │   ├── votes.js
│   │   ├── profiles.js
│   │   ├── notifications.js
│   │   └── stats.js
│   ├── .env                # Variables d'environnement (secrets)
│   ├── .env.example        # Modèle d'environnement
│   └── package.json
│
├── forum-frontend/         # Application React (Vite)
│   ├── src/
│   │   ├── App.jsx         # Routeur principal
│   │   ├── main.jsx        # Point d'entrée React
│   │   ├── supabaseClient.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx  # Navigation globale
│   │   │   └── Skeleton.jsx
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── ThreadView.jsx
│   │       ├── CategoryView.jsx
│   │       ├── NewThread.jsx
│   │       ├── Profile.jsx
│   │       ├── Login.jsx
│   │       └── SearchResults.jsx
│   ├── .env                # Variables d'environnement frontend
│   └── package.json
│
└── setup.sql               # Script de création de la base de données
```

---

## 🏗️ 2. Architecture Globale

### Pattern Architectural
Le projet adopte une architecture **Full-Stack découplée** composée de trois couches :

```
[Client React] ──────► [Backend Express] ──────► [Supabase (PostgreSQL)]
      │                                                     ▲
      └──────────────── (Supabase JS Client) ───────────────┘
              (Auth, Realtime, opérations directes)
```

> [!IMPORTANT]
> Il existe une **double voie d'accès à la base de données** : via l'API Express (pour la plupart des lectures) et via le client Supabase JS directement depuis le frontend (pour l'auth, les votes dans ThreadView, les posts, et les notifications en temps réel). C'est un point architectural important à harmoniser.

### Flux de données typique
1. L'utilisateur s'authentifie via **Supabase Auth** (depuis le frontend directement)
2. Les lectures de données passent par l'**API Express** (appels axios)
3. Les écritures sensibles (votes, posts) utilisent parfois le **client Supabase JS** côté frontend
4. Les **notifications en temps réel** utilisent les Realtime Channels de Supabase

---

## ⚙️ 3. Backend — `forum-backend`

### Stack Technique
| Technologie | Version | Rôle |
|---|---|---|
| Node.js | LTS | Runtime |
| Express | ^5.2.1 | Framework HTTP |
| @supabase/supabase-js | ^2.99.3 | ORM/Client BDD |
| dotenv | ^17.3.1 | Gestion des secrets |
| cors | ^2.8.6 | CORS middleware |

### Configuration du Serveur (`index.js`)
- Port configurable via `process.env.PORT` (défaut : **4000**)
- CORS activé **sans restriction de domaine** (problème de sécurité en production)
- JSON body-parser intégré
- 7 préfixes de routes montés sous `/api/`

### Détail des Routes

#### `GET /api/categories`
- Récupère toutes les catégories triées par nom
- Enrichit chaque catégorie avec le **nombre de threads** via `Promise.all()` parallèle
- ⚠️ **N+1 Problem** : fait 1 requête par catégorie pour les comptages

#### `GET /api/categories/:slug`
- Récupère une catégorie par slug + son nombre de threads

#### `GET /api/threads`
- Filtre optionnel par `category_id` et `query` (recherche `ilike`)
- Trie : épinglés en premier, puis par date décroissante
- Enrichit chaque thread avec ses votes (2 requêtes au total)

#### `GET /api/threads/:id`
- Récupère thread + profil auteur + catégorie + posts + votes (thread + posts)
- **Incrémente `view_count`** à chaque visite (pas de déduplication par session/IP)
- Retourne un objet composé `{ ...thread, posts }`

#### `POST /api/threads`
- Création simple d'un thread sans validation serveur

#### `POST /api/posts`
- Crée un post/réponse
- Envoie une notification à l'auteur du thread si différent du posteur

#### `POST /api/votes` (logique toggle)
- Vérifie si un vote existe : même valeur → suppression, valeur différente → mise à jour, absent → création
- Crée une notification d'upvote si `value === 1`
- **Duplication** : la logique de notification existe aussi dans les triggers SQL

#### `GET /api/profiles/:username`
- Profil + tous ses threads + tous ses posts avec comptages

#### `GET /api/profiles/leaderboard/top`
- Top 10 utilisateurs par karma
- ✅ **Fixé** : route déplacée au-dessus de `/:username` pour éviter le conflit de routing Express

#### `GET /api/notifications/:userId` + `PATCH /api/notifications/:id/read`

#### `GET /api/stats`
- Compte en parallèle : users, threads, posts

### Problèmes Identifiés — Backend

| # | Problème | Sévérité | Statut |
|---|---|---|---|
| 1 | CORS `app.use(cors())` sans liste blanche de domaines | 🔴 Critique | ✅ **Corrigé** — CORS restreint via `FRONTEND_URL` |
| 2 | Aucun middleware d'authentification sur les routes de mutation | 🔴 Critique | ⏳ À faire |
| 3 | N+1 queries pour les comptages de catégories | 🟡 Moyen | ⏳ À faire |
| 4 | `user_id` passé dans le corps de la requête POST (non vérifié) | 🔴 Critique | ⏳ À faire |
| 5 | Absence de validation/sanitisation des entrées | 🔴 Critique | ⏳ À faire |
| 6 | Duplication de la logique de notification (code JS + triggers SQL) | 🟡 Moyen | ⏳ À faire |
| 7 | `view_count` incrémenté sans déduplication | 🟢 Faible | ⏳ À faire |
| 8 | Aucune pagination sur les listes de threads | 🟡 Moyen | ⏳ À faire |
| 9 | Pas de rate limiting | 🟡 Moyen | ⏳ À faire |
| 10 | Supabase client créé dans chaque fichier de route (non centralisé) | 🟢 Faible | ⏳ À faire |
| 11 | Route `/leaderboard/top` inaccessible (conflit avec `/:username`) | 🔴 Bug | ✅ **Corrigé** — route réordonnée |

---

## 🎨 4. Frontend — `forum-frontend`

### Stack Technique
| Technologie | Version | Rôle |
|---|---|---|
| React | ^19.2.4 | UI Framework |
| Vite | ^8.0.1 | Bundler/Dev Server |
| React Router DOM | ^7.13.1 | Navigation SPA |
| TailwindCSS | ^4.2.2 | Styling |
| @supabase/supabase-js | ^2.99.3 | Auth + Realtime |
| axios | ^1.13.6 | Requêtes HTTP |
| react-markdown | ^10.1.0 | Rendu Markdown |
| lucide-react | ^0.577.0 | Icônes |
| date-fns | ^4.1.0 | Formatage de dates |
| clsx + tailwind-merge | latest | Utilitaires CSS |

### Routage (`App.jsx`)
| Route | Composant | Description |
|---|---|---|
| `/` | `Home` | Page d'accueil avec hero, catégories, fils récents |
| `/category/:slug` | `CategoryView` | Liste des threads d'une catégorie |
| `/thread/:id` | `ThreadView` | Discussion complète avec réponses |
| `/new-thread` | `NewThread` | Formulaire de création |
| `/profile/:username` | `Profile` | Profil utilisateur |
| `/search` | `SearchResults` | Résultats de recherche |
| `/login` | `Login` | Connexion |
| `/register` | `Login` | Inscription (même composant) |

### Design System
- **Couleur primaire** : `#1a5c3a` (vert FPK)
- **Couleur secondaire** : `amber-400` (#FBBF24)
- **Fond** : `#f8f9fa`
- **Typographie** : Police système (`font-sans`)
- **Radius** : Généreusement arrondi (jusqu'à `rounded-[2.5rem]`)
- **Ombres** : `shadow-xl` avec teintes colorées (`shadow-[#1a5c3a]/20`)

### Analyse par Page

#### `Navbar.jsx` (~240 lignes)
- Navigation sticky avec logo animé
- Barre de recherche desktop + raccourci `CTRL+K` (affiché mais non fonctionnel)
- Dropdown notifications avec badge rouge animé + subscription Realtime
- Dropdown profil avec karma affiché
- Auth state listener via `supabase.auth.onAuthStateChange`
- ✅ Timestamps de notifications dynamiques (via `date-fns`)
- ✅ Bouton "Tout marquer lu" fonctionnel
- ✅ Messages de notification contextuels (reply vs. vote)

#### `Home.jsx` (270 lignes)
- Hero section avec gradient, animation `pulse`, recherche
- Grille de catégories responsive avec skeleton loading
- Liste des dernières discussions
- Sidebar : stats, guide, charte communautaire
- Chargement parallèle (`Promise.all`) des catégories, threads et stats

#### `ThreadView.jsx` (338 lignes)
- Vue principale d'un thread avec système de vote
- Markdown rendu via `react-markdown`
- **Realtime** : channel Supabase pour les nouveaux posts (`postgres_changes`)
- Réponses imbriquées sur 1 niveau (parent/enfant)
- Votation directe via Supabase JS client (bypass du backend)
- Appel de la procédure stockée `increment_karma` via `supabase.rpc()`
- ⚠️ Pas de toast/confirmation après partage du lien

#### `CategoryView.jsx` (178 lignes)
- Header catégorie avec icône Lucide dynamique
- Filtres "Plus récents / Plus vus / Top votes" — **non fonctionnels** (UI seulement)
- Affichage des badges de tag colorés par type

#### `NewThread.jsx` (165 lignes)
- Éditeur/Aperçu Markdown switché
- Sélecteur de catégorie + tag (4 options)
- Redirection vers `/login` si non connecté
- ⚠️ Insert direct via Supabase JS, bypass du backend Express

#### `Profile.jsx` (198 lignes)
- Hero profil avec avatar, karma, date d'adhésion
- Badge shield pour karma > 100
- Grille 2 colonnes : discussions lancées + contributions récentes

#### `Login.jsx` (145 lignes)
- Composant dual : connexion + inscription selon l'URL
- Auth entièrement via `supabase.auth`
- ⚠️ Validation email académique suggérée par le placeholder mais non enforced

### Problèmes Identifiés — Frontend

| # | Problème | Sévérité | Statut |
|---|---|---|---|
| 1 | Filtres de tri dans `CategoryView` non fonctionnels | 🟡 Moyen | ⏳ À faire |
| 2 | Timestamps de notifications figés ("Il y a 2 min") | 🟡 Moyen | ✅ **Corrigé** |
| 3 | Raccourci `CTRL+K` non implémenté | 🟢 Faible | ⏳ À faire |
| 4 | Pas de toast/feedback UI après actions (vote, partage, erreurs) | 🟡 Moyen | ⏳ À faire |
| 5 | `NewThread` bypass le backend et écrit directement dans Supabase | 🟡 Moyen | ⏳ À faire |
| 6 | Absence de composant `ProtectedRoute` | 🟡 Moyen | ⏳ À faire |
| 7 | Pas de gestion d'état global — re-fetch à chaque composant | 🟡 Moyen | ⏳ À faire |
| 8 | Vote dans `ThreadView` incohérent avec l'API backend | 🟢 Faible | ⏳ À faire |
| 9 | Email académique non validé à l'inscription | 🟡 Moyen | ⏳ À faire |
| 10 | Pas de gestion des erreurs réseau | 🟢 Faible | ⏳ À faire |
| 11 | Pas de meta SEO dynamiques par page | 🟡 Moyen | ⏳ À faire |
| 12 | Bouton "Tout marquer lu" sans handler | 🟡 Moyen | ✅ **Corrigé** |
| 13 | `App.css` contenait du boilerplate Vite inutilisé | 🟢 Faible | ✅ **Nettoyé** |

---

## 🗄️ 5. Base de Données — `setup.sql`

### Schéma (PostgreSQL via Supabase)

```
auth.users (Supabase Built-in)
     │
     ▼
profiles (id PK → auth.users)
     │
     ├──► threads (user_id FK)
     │         │
     │         ├──► posts (thread_id FK)
     │         │       └──► posts (parent_post_id FK — nesting 1 niveau)
     │         │
     │         └──► votes (target_id polymorphe)
     │
     └──► notifications (user_id FK)

categories ──► threads (category_id FK)
```

### Tables Principales

#### `profiles`
| Colonne | Type | Notes |
|---|---|---|
| id | UUID | FK → `auth.users`, PK |
| username | TEXT | UNIQUE, NOT NULL |
| avatar_url | TEXT | URL de l'avatar |
| bio | TEXT | Biographie |
| karma | INTEGER | Score, default 0 |
| created_at | TIMESTAMPTZ | |

#### `categories` (7 catégories en seed)
| Colonne | Type | Notes |
|---|---|---|
| id | UUID | gen_random_uuid() |
| name | TEXT | Nom affiché |
| slug | TEXT | UNIQUE, URL-friendly |
| description | TEXT | |
| icon | TEXT | Nom d'icône Lucide |

#### `threads`
| Colonne | Type | Notes |
|---|---|---|
| id | UUID | |
| title | TEXT | NOT NULL |
| body | TEXT | Markdown supporté |
| category_id | UUID | FK → categories |
| user_id | UUID | FK → profiles |
| tag | TEXT | Default 'Discussion' |
| view_count | INTEGER | Default 0 |
| is_pinned | BOOLEAN | Default false |

#### `posts`
| Colonne | Type | Notes |
|---|---|---|
| content | TEXT | NOT NULL |
| thread_id | UUID | FK → threads |
| user_id | UUID | FK → profiles |
| parent_post_id | UUID | FK → posts (self-ref, 1 niveau) |

#### `votes`
| Colonne | Type | Notes |
|---|---|---|
| user_id | UUID | FK → profiles |
| target_id | UUID | ID polymorphe (thread ou post) |
| target_type | TEXT | CHECK: 'post' ou 'thread' |
| value | INTEGER | CHECK: 1 ou -1 |
| UNIQUE(user_id, target_id) | | Un vote par utilisateur/item |

> [!WARNING]
> `votes.target_id` est polymorphe sans vraie FK PostgreSQL — l'intégrité référentielle n'est pas garantie par la BDD.

#### `notifications`
| Colonne | Type | Notes |
|---|---|---|
| user_id | UUID | FK → profiles |
| type | TEXT | 'reply' ou 'vote' |
| reference_id | UUID | ID du thread/post (pas de FK) |
| is_read | BOOLEAN | Default false |

### Fonctions et Triggers

| Fonction/Trigger | Déclencheur | Action |
|---|---|---|
| `handle_new_user()` | `AFTER INSERT ON auth.users` | Crée automatiquement un profil |
| `increment_karma(user_id, amount)` | Appelée manuellement (RPC) | Modifie le karma |
| `handle_new_notification()` | `AFTER INSERT ON posts` + `votes` | Crée des notifications automatiques |

### Catégories Seed
`Informatique`, `Mathématiques`, `Économie`, `Langues`, `Sciences`, `Vie étudiante`, `Annonces`

### Row Level Security (RLS)

| Table | Lecture Publique | Écriture Authentifiée |
|---|---|---|
| profiles | ✅ | ✅ Propriétaire uniquement |
| categories | ✅ | ❌ Non défini |
| threads | ✅ | ✅ Auteur uniquement |
| posts | ✅ | ✅ Auteur uniquement |
| votes | ✅ | ✅ Propriétaire uniquement |
| notifications | ❌ Privé | ✅ Propriétaire uniquement |

### Problèmes Identifiés — Base de Données

| # | Problème | Sévérité |
|---|---|---|
| 1 | `votes.target_id` polymorphe sans FK réelle | 🟡 Moyen |
| 2 | Pas de contrainte CHECK sur `threads.tag` | 🟢 Faible |
| 3 | Pas de politique RLS pour DELETE sur threads/posts | 🟡 Moyen |
| 4 | Pas de politique INSERT sur `categories` (admin non géré) | 🟡 Moyen |
| 5 | `reference_id` dans notifications sans FK | 🟡 Moyen |
| 6 | Notification dupliquée possible (trigger SQL + code Node.js) | 🟡 Moyen |
| 7 | Karma non mis à jour lors de la suppression d'un vote | 🟡 Moyen |
| 8 | Aucun index explicite défini (hors PK/UNIQUE) | 🟢 Faible |

---

## 🔒 6. Sécurité

### Points Positifs ✅
- Supabase RLS activé sur toutes les tables
- Authentification déléguée à Supabase Auth (standard élevé)
- Variables d'environnement utilisées pour les secrets
- Fichiers `.env.example` fournis

### Vulnérabilités Identifiées

| Vulnérabilité | Impact | Recommandation |
|---|---|---|
| CORS ouvert | N'importe quel domaine peut appeler l'API | Restreindre à l'URL du frontend |
| `user_id` dans le body des POST | Poster au nom d'un autre utilisateur | Extraire `user_id` depuis le JWT côté serveur |
| Aucune validation des entrées | XSS, données corrompues | Utiliser Zod ou Joi |
| Pas de rate limiting | Brute-force, spam | express-rate-limit |
| Email non validé à l'inscription | Comptes non-étudiants | Valider le domaine `@fpk.ac.ma` |

---

## ⚡ 7. Performance

### Forces ✅
- Chargements parallèles avec `Promise.all()` dans plusieurs endroits
- Skeleton loading states pour l'UX perçue
- Realtime via WebSocket Supabase (pas de polling)
- `useCallback` pour stabiliser les fonctions dépendantes

### Faiblesses ⚠️
- **N+1 queries** dans `/api/categories`
- Pas de pagination réelle
- `fetchThread()` complet sur chaque événement Realtime
- Pas de cache client (React Query, SWR)
- Import `* as LucideIcons` dans `Home` et `CategoryView` (bundle size)

---

## 🧩 8. Qualité du Code

### Points Positifs ✅
- Code bien structuré et lisible
- Commentaires pertinents dans les fichiers clés
- Composant `Skeleton` réutilisable
- Gestion des états vides/erreurs avec des UIs dédiées

### Points à Améliorer ⚠️
- Pas de tests unitaires ni d'intégration
- `API_URL` dupliqué dans chaque page (pas de module centralisé `api.js`)
- Logique de notifications dupliquée entre backend et triggers SQL
- Pas de TypeScript
- Pas de linting configuré côté backend

---

## 🗺️ 9. Fonctionnalités Implémentées vs. Manquantes

### ✅ Implémentées
- Inscription & connexion via email/password
- Profil utilisateur avec karma, threads, posts
- Catégories avec icônes dynamiques
- Threads avec tags et Markdown
- Réponses imbriquées (1 niveau)
- Système de vote ±1 (toggle)
- Notifications en temps réel (reply + upvote)
- Recherche par titre
- Compteur de vues
- Threads épinglés
- Skeleton loading
- Partage de lien (clipboard)
- API leaderboard karma

### ❌ Manquantes / Partielles
- Filtres de tri (Plus vus, Top votes) — UI seulement
- Pagination
- Validation email académique
- Suppression et édition de contenu
- Upload d'avatar
- Toast notifications
- Affichage du leaderboard en UI
- Administration/modération
- `CTRL+K` fonctionnel
- Dark mode
- Navigation depuis notification → thread

### 🔧 Récemment Corrigé
- ✅ CORS restreint à l'URL du frontend
- ✅ Route leaderboard réparée (conflit `/:username`)
- ✅ Timestamps de notifications dynamiques
- ✅ Bouton "Tout marquer lu" fonctionnel
- ✅ Messages de notification contextuels (reply vs. vote)
- ✅ `App.css` nettoyé du boilerplate Vite
- ✅ `FRONTEND_URL` ajouté au `.env` et `.env.example`

---

## 🚀 10. Recommandations d'Amélioration

### Priorité Haute 🔴
1. **Sécuriser le backend** : Middleware JWT qui vérifie et extrait `user_id` automatiquement
2. ~~**Restreindre CORS**~~ : ✅ Fait — `cors({ origin: process.env.FRONTEND_URL })`
3. **Valider les entrées** : Ajouter Zod ou Joi pour toutes les routes POST/PATCH
4. **Centraliser le client Supabase** dans un module `db.js` partagé côté backend

### Priorité Moyenne 🟡
5. **Implémenter la pagination** côté API et frontend
6. **Résoudre les N+1** : vue SQL ou `GROUP BY` pour les comptages de catégories
7. **Harmoniser l'accès BDD** : choisir entre API Express ou Supabase JS direct
8. **Ajouter un système de toast** (react-hot-toast ou Sonner)
9. **Implémenter les filtres de tri** dans `CategoryView`
10. **Valider l'email académique** à l'inscription

### Priorité Basse 🟢
11. Ajouter TypeScript progressivement
12. React Query pour le cache et la synchronisation
13. Configurer ESLint + Prettier côté backend
14. Tests (Vitest frontend, Jest/Supertest backend)
15. Centraliser `API_URL` dans un module `src/api/`

---

## 📊 11. Synthèse Globale

| Aspect | Score | Commentaire |
|---|---|---|
| Architecture | 7/10 | Découplée et claire, double voie d'accès BDD à harmoniser |
| Fonctionnalités | 7/10 | Bon cœur fonctionnel, bugs critiques corrigés |
| Sécurité | 5/10 | CORS corrigé, auth backend reste à faire |
| Performance | 6/10 | Bonnes pratiques de base, N+1 à corriger |
| UI/UX | 8/10 | Design moderne, cohérent, animations et skeleton loading |
| Qualité de code | 7/10 | Lisible, boilerplate nettoyé, bugs fixés |
| Base de données | 7/10 | Schéma bien pensé, RLS activé, quelques FK manquantes |

> [!TIP]
> Après les corrections appliquées le 06/06/2026, le projet est **prêt pour un premier déploiement**. Les priorités restantes sont la **sécurisation complète du backend** (auth middleware, validation des entrées) et l'**harmonisation des écritures** (tout passer par l'API Express).

---

## 🌐 12. Déploiement (Vercel)

### Backend (`forum-backend`)
- **Statut** : ✅ En ligne
- **URL** : `https://hub-fpk.vercel.app/`
- **Framework Preset** : Express / Node.js
- **Variables d'environnement clés** :
  - `FRONTEND_URL` : L'URL du frontend déployé (indispensable pour que le CORS autorise les requêtes).
  - Variables Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

### Frontend (`forum-frontend`)
- **Framework Preset** : Vite
- **Variables d'environnement clés** :
  - `VITE_API_URL` : `https://hub-fpk.vercel.app` (URL du backend).
  - Variables Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

---

*Analyse réalisée le 06/06/2026 — Mise à jour le 06/06/2026 — Version : HubFPK API v2*
