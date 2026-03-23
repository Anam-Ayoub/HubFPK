const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// POST or DELETE a vote (toggle behavior)
router.post('/', async (req, res) => {
  const { user_id, target_id, target_type, value } = req.body;
  try {
    // Check for existing vote
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user_id)
      .eq('target_id', target_id)
      .single();

    if (existingVote) {
      if (existingVote.value === value) {
        // Same value clicked -> remove vote (toggle off)
        const { error } = await supabase.from('votes').delete().eq('id', existingVote.id);
        if (error) throw error;
        return res.json({ message: 'Vote removed' });
      } else {
        // Different value clicked -> update vote
        const { data: updated, error } = await supabase
          .from('votes')
          .update({ value })
          .eq('id', existingVote.id)
          .select()
          .single();
        if (error) throw error;
        return res.json(updated);
      }
    } else {
      // No existing vote -> create one
      const { data: created, error } = await supabase
        .from('votes')
        .insert([{ user_id, target_id, target_type, value }])
        .select()
        .single();

      if (error) throw error;

      // Handle karma updates and notifications logic (simple version)
      if (value === 1) {
        // Find owner of target to notify
        let targetTable = target_type === 'thread' ? 'threads' : 'posts';
        const { data: targetData } = await supabase.from(targetTable).select('user_id').eq('id', target_id).single();

        if (targetData && targetData.user_id !== user_id) {
          await supabase.from('notifications').insert({
            user_id: targetData.user_id,
            type: 'vote',
            reference_id: target_id
          });
        }
      }

      res.status(201).json(created);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
