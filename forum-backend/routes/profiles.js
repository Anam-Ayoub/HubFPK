const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET profile by username
router.get('/:username', async (req, res) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', req.params.username)
      .single();

    if (profileError) throw profileError;

    // Fetch user's threads with categories
    const { data: threads } = await supabase
      .from('threads')
      .select('*, categories(name, slug)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    // Fetch user's posts with thread info
    const { data: posts } = await supabase
      .from('posts')
      .select('*, threads(title, id)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    // Dynamic counts (already available in the arrays, but we could add them explicitly if needed)
    res.json({ 
      ...profile, 
      threads, 
      posts,
      thread_count: threads?.length || 0,
      post_count: posts?.length || 0
    });
  } catch (err) {
    res.status(404).json({ error: 'User not found' });
  }
});

// GET leaderboard (Top 10 users by karma)
router.get('/leaderboard/top', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, karma')
      .order('karma', { ascending: false })
      .limit(10);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
