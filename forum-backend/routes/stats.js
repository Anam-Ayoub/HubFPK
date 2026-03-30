const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET global stats
router.get('/', async (req, res) => {
  try {
    // Run 3 count queries in parallel
    const [
      { count: usersCount },
      { count: threadsCount },
      { count: postsCount }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('threads').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true })
    ]);

    res.json({
      users: usersCount || 0,
      threads: threadsCount || 0,
      posts: postsCount || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
