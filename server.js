const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// ─── MongoDB Connection (cached for serverless reuse) ───────────────────────
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    // Do NOT call process.exit(1) in serverless — it crashes the entire function
  }
};

// ─── Express App ─────────────────────────────────────────────────────────────
const app = express();

// Body parser
app.use(express.json());

// Set security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use('/api/', limiter);

// ✅ MUST be BEFORE routes — ensures DB is ready before any request is handled
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
const auth       = require('./routes/auth');
const notes      = require('./routes/notes');
const categories = require('./routes/categories');
const accounts   = require('./routes/accounts');

app.get('/', (req, res) => {
  res.send('Smart Notebook API is running...');
});

app.use('/api/auth',       auth);
app.use('/api/notes',      notes);
app.use('/api/categories', categories);
app.use('/api/accounts',   accounts);

// Error handler middleware (must be after routers)
app.use(errorHandler);

// ─── Local Development ───────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  );
}

// ─── Export for Vercel Serverless ────────────────────────────────────────────
module.exports = app;
