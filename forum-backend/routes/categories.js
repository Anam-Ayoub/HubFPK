const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET all categories
router.get('/', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;

    // Fetch counts for all categories in parallel
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const { count } = await supabase
          .from('threads')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', cat.id);
        
        return {
          ...cat,
          thread_count: count || 0
        };
      })
    );
    
    res.json(categoriesWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET category by slug
router.get('/:slug', async (req, res) => {
  try {
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', req.params.slug)
      .single();
    
    if (error) throw error;

    const { count } = await supabase
      .from('threads')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id);
    
    res.json({
      ...category,
      thread_count: count || 0
    });
  } catch (err) {
    res.status(404).json({ error: 'Category not found' });
  }
});

module.exports = router;
