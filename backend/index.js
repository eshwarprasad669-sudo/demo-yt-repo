require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const todoRoutes = require('./routes/todos');

const app = express();
app.use(cors());
app.use(express.json());

// Serverless-friendly connection: Vercel may reuse a warm instance, so we
// connect once and reuse the same connection on later requests.
let connectPromise = null;
function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!connectPromise) {
    connectPromise = mongoose.connect(process.env.MONGODB_URI).catch((err) => {
      connectPromise = null; // allow a retry on the next request
      throw err;
    });
  }
  return connectPromise;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/todos', todoRoutes);

// Central error handler: any error passed to next(err) ends up here.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Vercel imports this module and uses `app` directly.
module.exports = app;

// Locally (`npm run dev`), run it as a normal server on PORT.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  });
}
