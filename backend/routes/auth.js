import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kerala_coastal_secret_key_123';

// MIDDLEWARE to authenticate JWT token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No session token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired or invalid token.' });
    }
    req.user = decoded;
    next();
  });
}

// SIGNUP ROUTE
router.post('/signup', async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    // Check if user already exists
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const newUser = await db.createUser({
      name,
      email,
      phone,
      password: hashedPassword
    });

    // Create session token
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(210).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        favoriteBeaches: [],
        favoriteDistricts: []
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user
    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Create session token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        favoriteBeaches: user.favoriteBeaches || [],
        favoriteDistricts: user.favoriteDistricts || []
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET CURRENT USER PROFILE
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error fetching profile' });
  }
});

// TOGGLE FAVORITE BEACH
router.post('/favorite/beach', authenticateToken, async (req, res) => {
  const { beachId } = req.body;
  if (!beachId) return res.status(400).json({ error: 'Beach ID required' });

  try {
    const favorites = await db.toggleFavoriteBeach(req.user.id, beachId);
    res.json({ message: 'Favorites updated', favoriteBeaches: favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE FAVORITE DISTRICT
router.post('/favorite/district', authenticateToken, async (req, res) => {
  const { districtId } = req.body;
  if (!districtId) return res.status(400).json({ error: 'District ID required' });

  try {
    const favorites = await db.toggleFavoriteDistrict(req.user.id, districtId);
    res.json({ message: 'Favorites updated', favoriteDistricts: favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
