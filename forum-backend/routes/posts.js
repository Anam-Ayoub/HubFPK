const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// POST new post (reply)
router.post('/', async (req, res) => {
  const { content, thread_id, user_id, parent_post_id } = req.body;
  try {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert([{ content, thread_id, user_id, parent_post_id }])
      .select('*, profiles(username, avatar_url)')
      .single();

    if (postError) throw postError;

    // Fetch the thread to find the author to notify
    const { data: thread } = await supabase.from('threads').select('user_id').eq('id', thread_id).single();

    if (thread && thread.user_id !== user_id) {
      // Notify thread owner
      await supabase.from('notifications').insert({
        user_id: thread.user_id,
        type: 'reply',
        reference_id: thread_id
      });
    }

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
