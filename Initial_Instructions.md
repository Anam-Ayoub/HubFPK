# Forum Website — Setup Guide

A step-by-step guide to build a modern student forum using **React + Vite**, **Node.js + Express**, and **Supabase**, deployed for free on **Vercel** and **Render**.

---

## Stack Overview

| Layer | Technology | Free Hosting |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Vercel |
| Backend | Node.js + Express | Render |
| Database + Auth | Supabase (PostgreSQL) | Supabase free tier |

---

## Prerequisites

Make sure you have these installed before starting:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- A code editor (VS Code recommended)

Create free accounts on:

- [supabase.com](https://supabase.com)
- [vercel.com](https://vercel.com)
- [render.com](https://render.com)

---

## Step 1 — Set Up Supabase (Database + Auth)

### 1.1 Create a project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, give it a name (e.g. `student-forum`), and set a strong database password.
3. Wait for the project to finish provisioning (~1 minute).

### 1.2 Create the database tables

Go to **SQL Editor** in your Supabase dashboard and run the following:

```sql
-- Categories (forum sections)
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Threads (discussion topics)
CREATE TABLE threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Posts (replies inside threads)
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
Still in the SQL Editor, run:

ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read" ON posts FOR SELECT USING (true);

-- Only authenticated users can write
CREATE POLICY "Auth insert threads" ON threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth insert posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 1.4 Get your API keys

Go to **Project Settings → API** and note down:

CREATE POLICY "Public read" ON threads FOR SELECT USING (true);
-- Allow anyone to read
```sql
- **Project URL** (looks like `https://xxxx.supabase.co`)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- Enable RLS on all tables
);
- **Anon/Public key**


---

## Step 2 — Build the Backend (Node.js + Express)


### 2.1 Initialize the project


```bash

mkdir forum-backend
cd forum-backend

npm init -y

npm install express cors dotenv @supabase/supabase-js

```

### 2.2 Project structure

```
forum-backend/
├── .env
├── index.js

└── routes/
    ├── threads.js
    └── posts.js
```

### 2.3 Create `.env`

```env
PORT=4000
SUPABASE_URL=https://your-project.supabase.co

SUPABASE_KEY=your-anon-key
```
  console.log(`Server running on port ${process.env.PORT}`);
```

### 2.5 Create `routes/threads.js`

```js
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Get all threads
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('threads')
const express = require('express');
    .select('*, categories(name)')
    .order('created_at', { ascending: false });
});
app.listen(process.env.PORT, () => {



### 2.4 Create `index.js`

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
```js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
});

app.get('/', (req, res) => res.send('Forum API running'));


// Get a single thread with its posts
router.get('/:id', async (req, res) => {
const threadsRouter = require('./routes/threads');
const postsRouter = require('./routes/posts');

app.use('/api/threads', threadsRouter);
  const { data, error } = await supabase
    .from('threads')
app.use('/api/posts', postsRouter);
const app = express();
app.use(cors());
app.use(express.json());


    .select('*, posts(*)')

    .eq('id', req.params.id)

    .single();


  if (error) return res.status(404).json({ error: 'Thread not found' });
  res.json(data);
});


// Create a thread
router.post('/', async (req, res) => {
  const { title, category_id, user_id } = req.body;
  const { data, error } = await supabase

    .from('threads')

    .insert([{ title, category_id, user_id }])
    .select()

    .single();


  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data);

});

module.exports = router;
```


### 2.6 Create `routes/posts.js`


```js
const express = require('express');
const router = express.Router();

const { createClient } = require('@supabase/supabase-js');


const supabase = createClient(
  process.env.SUPABASE_URL,

  process.env.SUPABASE_KEY
);

// Add a reply to a thread
router.post('/', async (req, res) => {
  const { content, thread_id, user_id } = req.body;
  const { data, error } = await supabase
    .from('posts')
    .insert([{ content, thread_id, user_id }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});


module.exports = router;
```


### 2.7 Test it locally


```bash

node index.js

# → Server running on port 4000

```


---


## Step 3 — Build the Frontend (React + Vite)

### 3.1 Create the project


```bash

npm create vite@latest forum-frontend -- --template react
cd forum-frontend

npm install

npm install @supabase/supabase-js axios react-router-dom

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```


### 3.2 Configure Tailwind


In `tailwind.config.js`:


```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

In `src/index.css`, replace the contents with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```


### 3.3 Project structure


```
forum-frontend/

├── .env

└── src/

    ├── main.jsx
    ├── App.jsx

    ├── supabaseClient.js

    └── pages/

        ├── Home.jsx
        ├── ThreadView.jsx
        └── Login.jsx

```


### 3.4 Create `.env`


```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

VITE_API_URL=http://localhost:4000
```


### 3.5 Create `src/supabaseClient.js`


```js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,

  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### 3.6 Create `src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ThreadView from './pages/ThreadView';
import Login from './pages/Login';

export default function App() {
  return (

    <BrowserRouter>

      <div className="max-w-3xl mx-auto px-4 py-8">

        <h1 className="text-3xl font-bold mb-6">Student Forum</h1>

        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/thread/:id" element={<ThreadView />} />

          <Route path="/login" element={<Login />} />

        </Routes>
      </div>

    </BrowserRouter>

  );

}
```


### 3.7 Create `src/pages/Home.jsx`


```jsx
import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import axios from 'axios';


export default function Home() {
  const [threads, setThreads] = useState([]);


  useEffect(() => {

    axios.get(`${import.meta.env.VITE_API_URL}/api/threads`)

      .then(res => setThreads(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Recent threads</h2>
      <ul className="space-y-3">
        {threads.map(t => (
          <li key={t.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <Link to={`/thread/${t.id}`} className="font-medium text-blue-600 hover:underline">
              {t.title}
            </Link>

            <p className="text-sm text-gray-500 mt-1">{t.categories?.name}</p>

          </li>
        ))}

      </ul>

    </div>

  );

}

```


### 3.8 Create `src/pages/Login.jsx`


```jsx

import { useState } from 'react';
import { supabase } from '../supabaseClient';


export default function Login() {

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');


  const handleLogin = async (e) => {

    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setMessage(error ? error.message : 'Logged in!');
  };


  const handleSignup = async (e) => {

    e.preventDefault();

    const { error } = await supabase.auth.signUp({ email, password });

    setMessage(error ? error.message : 'Check your email to confirm!');
  };

  return (
    <div className="max-w-sm mx-auto mt-10 space-y-4">

      <h2 className="text-xl font-semibold">Login / Sign up</h2>

      <input
        type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)}

        className="w-full border rounded p-2"
      />

      <input
        type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full border rounded p-2"

      />
      <div className="flex gap-2">
        <button onClick={handleLogin} className="flex-1 bg-blue-600 text-white rounded p-2">Login</button>
        <button onClick={handleSignup} className="flex-1 border rounded p-2">Sign up</button>

      </div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>

  );
}
```

---


## Step 4 — Deploy for Free

### 4.1 Deploy the backend to Render


1. Push the `forum-backend` folder to a GitHub repository.
2. Go to [render.com](https://render.com) → **New Web Service** → connect your repo.
3. Set the following:

   - **Build command:** `npm install`
   - **Start command:** `node index.js`
4. Add your environment variables (`SUPABASE_URL`, `SUPABASE_KEY`, `PORT`) in the **Environment** tab.
5. Click **Deploy**. Render gives you a URL like `https://forum-backend.onrender.com`.


> ⚠️ On the free tier, Render spins down after 15 min of inactivity. The first request may take ~30 seconds to wake up. This is normal.


### 4.2 Deploy the frontend to Vercel

1. Push the `forum-frontend` folder to a separate GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Add your environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` pointing to your Render URL).

4. Click **Deploy**. Vercel gives you a URL like `https://forum-frontend.vercel.app`.


---


## Optional — Skip the Backend Entirely


If you want the simplest possible setup, you can call Supabase directly from React without Express. This works well for smaller forums.


```js
// Fetch threads directly from Supabase in your component

const { data } = await supabase
  .from('threads')

  .select('*, categories(name)')
  .order('created_at', { ascending: false });

```


This removes the need for a backend server entirely. Just make sure your RLS policies are set correctly so users can't access data they shouldn't.


---

## Summary


```

Browser → React (Vercel) → Express API (Render) → Supabase (PostgreSQL)
```


| What | Free limit |
|---|---|
| Supabase | 500 MB database, 50k active users/month |
| Vercel | Unlimited deploys, 100 GB bandwidth/month |

| Render | 750 hours/month (enough for 1 service) |
