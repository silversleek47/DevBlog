import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Reads the JWT from the httpOnly "token" cookie, verifies it, and attaches
 * the corresponding user document to req.user. Rejects with 401 on any
 * missing/invalid/expired token, and 500 on unexpected failures.
 */
const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired, please log in again' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('requireAuth error:', err.message);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};

export default requireAuth;
