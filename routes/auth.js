const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const router = express.Router();

// Configure Passport Google Strategy (only if credentials are provided)
const hasGoogleOAuth = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL;

if (hasGoogleOAuth) {
  console.log('Google OAuth enabled');
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { email: profile.emails[0].value } });
        
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: require('crypto').randomBytes(32).toString('hex'),
            googleId: profile.id,
            avatar: profile.photos[0]?.value
          });
        } else if (!user.googleId) {
          await user.update({ googleId: profile.id, avatar: profile.photos[0]?.value });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));
} else {
  console.log('Google OAuth disabled - credentials not provided');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id);
  done(null, user);
});

// Email/Password Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email sudah terdaftar' });
    
    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, apiKey: user.apiKey, plan: user.plan, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Email/Password Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('=== LOGIN ===');
    console.log('Email:', email);
    
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validPassword(password))) {
      console.log('Login failed - invalid credentials');
      return res.status(401).json({ error: 'Email atau password salah' });
    }
    
    // Check if banned
    if (user.isBanned) {
      return res.status(403).json({ error: 'Akun Anda telah di-ban. Alasan: ' + (user.banReason || 'Melanggar ketentuan') });
    }
    
    console.log('Login success - User ID:', user.id, 'Email:', user.email, 'Role:', user.role);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, apiKey: user.apiKey, plan: user.plan, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Google OAuth (only if enabled)
router.get('/google', (req, res, next) => {
  if (!hasGoogleOAuth) {
    return res.status(503).json({ error: 'Google OAuth is not configured' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!hasGoogleOAuth) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_disabled`);
  }
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed` })(req, res, next);
}, (req, res) => {
  console.log('=== GOOGLE LOGIN CALLBACK ===');
  console.log('User ID:', req.user.id, 'Email:', req.user.email);
  
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const user = {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    apiKey: req.user.apiKey,
    plan: req.user.plan,
    role: req.user.role
  };
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
});

// Get current user
router.get('/me', require('../middleware/auth'), async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
