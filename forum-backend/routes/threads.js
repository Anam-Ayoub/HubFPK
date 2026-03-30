const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET all threads (optional category filtering and search)
router.get('/', async (req, res) => {
  const { category_id, query } = req.query;
  try {
    let select = supabase
      .from('threads')
      .select('*, profiles(username, avatar_url), categories(name, slug, icon)');

    if (category_id) select = select.eq('category_id', category_id);
    if (query) select = select.ilike('title', `%${query}%`);

    const { data: threads, error: threadsError } = await select.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });

    if (threadsError) throw threadsError;

    // Fetch votes for these threads
    const threadIds = threads.map(t => t.id);
    if (threadIds.length > 0) {
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('*')
        .in('target_id', threadIds)
        .eq('target_type', 'thread');

      if (votesError) throw votesError;

      // Merge votes into threads
      threads.forEach(t => {
        t.votes = votes.filter(v => v.target_id === t.id);
      });
    } else {
      threads.forEach(t => t.votes = []);
    }

    res.json(threads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single thread by ID with its posts
router.get('/:id', async (req, res) => {
  try {
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .select('*, profiles(username, avatar_url), categories(*)')
      .eq('id', req.params.id)
      .single();

    if (threadError) throw threadError;

    // Fetch votes for the thread
    const { data: threadVotes, error: threadVotesError } = await supabase
      .from('votes')
      .select('*')
      .eq('target_id', req.params.id)
      .eq('target_type', 'thread');

    if (threadVotesError) throw threadVotesError;
    thread.votes = threadVotes;

    // Fetch posts for this thread
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url)')
      .eq('thread_id', req.params.id)
      .order('created_at', { ascending: true });

    if (postsError) throw postsError;

    // Fetch votes for these posts
    const postIds = posts.map(p => p.id);
    if (postIds.length > 0) {
      const { data: postVotes, error: postVotesError } = await supabase
        .from('votes')
        .select('*')
        .in('target_id', postIds)
        .eq('target_type', 'post');

      if (postVotesError) throw postVotesError;

      posts.forEach(p => {
        p.votes = postVotes.filter(v => v.target_id === p.id);
      });
    } else {
      posts.forEach(p => p.votes = []);
    }

    // Increment view count
    await supabase.from('threads').update({ view_count: (thread.view_count || 0) + 1 }).eq('id', req.params.id);

    res.json({ ...thread, posts });
  } catch (err) {
    res.status(404).json({ error: 'Thread not found' });
  }
});

// POST new thread
router.post('/', async (req, res) => {
  const { title, body, category_id, user_id, tag } = req.body;
  try {
    const { data, error } = await supabase
      .from('threads')
      .insert([{ title, body, category_id, user_id, tag }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
