<div align="center">
  <img src="docs/logo_FPK.png" alt="HubFPK Logo" width="150" />
  <h1>HubFPK</h1>
  <p><strong>A Full-Stack Community Platform for the Polydisciplinary Faculty of Khouribga (FPK)</strong></p>

  [![Vercel Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](#)
  [![React](https://img.shields.io/badge/React-19-blue?logo=react)](#)
  [![Express](https://img.shields.io/badge/Express-5.2-lightgrey?logo=express)](#)
  [![Supabase](https://img.shields.io/badge/Supabase-Database_&_Auth-3ECF8E?logo=supabase)](#)
</div>

<br />

HubFPK is a modern, real-time community forum built specifically for students of the Polydisciplinary Faculty of Khouribga (FPK). Inspired by platforms like Reddit and Stack Overflow, it provides a structured space for students to share resources, ask questions, and collaborate across different academic departments.

[**🌍 View the Live Project Presentation Site**](https://userv-alt.github.io/HubFPK/) (or your deployed docs URL)
[**🚀 Access the Live App**](https://hub-fpk-hw9z.vercel.app/)

---

## ✨ Key Features

- **Structured Academic Departments:** Discussions are organized by categories (Computer Science, Mathematics, Economics, Sciences, Languages, Student Life, Announcements).
- **Rich Text Markdown:** Write fully-featured posts using Markdown syntax with live preview, perfect for code snippets and mathematical formatting.
- **Reddit-style Voting & Karma:** Upvote or downvote threads and replies. Users earn reputation (Karma) for their helpful contributions.
- **Real-time Interactions:** Powered by Supabase Realtime (WebSockets), new posts, votes, and notifications appear instantly without refreshing the page.
- **Row Level Security (RLS):** Database operations are tightly secured at the Postgres level, ensuring users can only modify their own data.
- **Secure Authentication:** Complete registration and login system with email confirmation handled by Supabase Auth.

## 🏗️ Architecture & Tech Stack

HubFPK is built with a decoupled Full-Stack architecture:

### Frontend
- **Framework:** React (v19) + Vite
- **Styling:** TailwindCSS for responsive and modern UI
- **Icons & Content:** Lucide Icons, `react-markdown` for post rendering
- **State & Routing:** React Router DOM

### Backend API
- **Framework:** Node.js with Express.js
- **Architecture:** RESTful API exposing endpoints for threads, posts, categories, votes, profiles, and notifications
- **Security:** Strict CORS policies tailored to the frontend origin

### Database & Auth
- **Platform:** Supabase (PostgreSQL)
- **Features:** Triggers (auto-profile creation, auto-notifications), Row Level Security (RLS) policies, Realtime Channels

---

## 🚀 Getting Started

Follow these steps to run HubFPK locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A [Supabase](https://supabase.com/) account and project

### 1. Database Setup
1. Create a new project on Supabase.
2. Go to the SQL Editor and run the entire content of the [`setup.sql`](./setup.sql) file. This will:
   - Create all necessary tables (`profiles`, `categories`, `threads`, `posts`, `votes`, `notifications`).
   - Insert default departments.
   - Set up Row Level Security (RLS) policies.
   - Create the necessary database triggers and functions.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd forum-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `forum-backend` root:
   ```env
   PORT=4000
   FRONTEND_URL=http://localhost:5173
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd forum-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `forum-frontend` root:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:4000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

You can now view the app at `http://localhost:5173`!

---

## 📁 Project Structure

```text
HubFPK/
├── forum-backend/           # Express.js API
│   ├── routes/              # API endpoints (threads, posts, votes, etc.)
│   └── index.js             # Express server entry point
├── forum-frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/      # Reusable UI components (Navbar, etc.)
│   │   ├── pages/           # Main views (Home, ThreadView, Profile, etc.)
│   │   ├── App.jsx          # React Router setup
│   │   └── supabaseClient.js# Supabase initialization
│   └── tailwind.config.js   # Tailwind configuration
├── docs/                    # Project documentation & presentation website
├── setup.sql                # Database schema, RLS policies, and triggers
└── README.md                # This file
```

---

## 👨‍💻 Team & Contributors

This project was built as part of the **Citoyenneté et Initiation** module for the 2025-2026 academic year, supervised by **Mr. Chagraoui Mohamed**.

- **HABYBY Zahira**
- **EL MAHI Nadia**
- **EL HOSSI Fatima Zahra**
- **ANAM Ayoub**

---

<div align="center">
  <i>If you find this project helpful, please consider giving it a ⭐!</i>
</div>
