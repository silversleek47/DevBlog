import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import * as authController from './controllers/authController.js';
import * as postController from './controllers/postController.js';
import requireAuth from './middleware/requireAuth.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined in environment variables');
  process.exit(1);
}
if (!MONGO_URI) {
  console.error('FATAL: MONGO_URI is not defined in environment variables');
  process.exit(1);
}

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ----- Auth routes -----
app.post('/api/auth/signup', authController.signup);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', authController.logout);
app.get('/api/auth/me', requireAuth, authController.getMe);

// ----- Post routes -----
app.get('/api/posts', postController.getAllPosts);
app.get('/api/posts/:id', postController.getPostById);
app.post('/api/posts', requireAuth, postController.createPost);
app.delete('/api/posts/:id', requireAuth, postController.deletePost);
app.post('/api/posts/:id/summary', requireAuth, postController.generateSummary);

// ----- 404 handler -----
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ----- Global error handler (catches anything thrown/next(err) upstream) -----
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
