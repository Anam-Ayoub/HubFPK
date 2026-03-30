const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Route imports
const categoriesRouter = require('./routes/categories');
const threadsRouter = require('./routes/threads');
const postsRouter = require('./routes/posts');
const votesRouter = require('./routes/votes');
const profilesRouter = require('./routes/profiles');
const notificationsRouter = require('./routes/notifications');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/threads', threadsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/votes', votesRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/stats', statsRouter);

app.get('/', (req, res) => {
  res.send('HubFPK API v2 is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
