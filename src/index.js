
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('./config/passport'); // Our passport configuration
const User = require('./features/users/userModel');

const app = express();
const port = 3000;

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(passport.initialize());

// ===== AUTHENTICATION MIDDLEWARE =====
// This middleware verifies the JWT and attaches the user to the request.
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.sendStatus(403); // Forbidden
      }

      // Find the user from the payload and attach it to the request
      const user = User.findById(userPayload.id);
      if (!user) {
        return res.sendStatus(404); // User not found
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};

// ===== PUBLIC ROUTES =====

// A simple homepage with login links
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the Quizz App</h1>
    <p>Please log in to continue.</p>
    <a href="/auth/google" style="padding: 10px; background-color: #db4437; color: white; text-decoration: none; border-radius: 5px;">Login with Google</a>
    <br/><br/>
    <a href="/auth/github" style="padding: 10px; background-color: #333; color: white; text-decoration: none; border-radius: 5px;">Login with GitHub</a>
  `);
});

// ===== OAUTH AUTHENTICATION ROUTES =====

// --- Google --- 
// Step 1: Redirect to Google's login page
app.get('/auth/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

// Step 2: Google redirects back to this callback URL
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req, res) => {
    // On successful authentication, req.user is available.
    // We sign a JWT and send it back to the user.
    const payload = { id: req.user.id, provider: req.user.provider };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ 
      message: "Authentication successful!",
      token: token,
      user: req.user
    });
  }
);

// --- GitHub ---
// Step 1: Redirect to GitHub's login page
app.get('/auth/github', passport.authenticate('github', { session: false, scope: ['user:email'] }));

// Step 2: GitHub redirects back to this callback URL
app.get(
  '/auth/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/' }),
  (req, res) => {
    // On successful authentication, sign a JWT.
    const payload = { id: req.user.id, provider: req.user.provider };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ 
      message: "Authentication successful!",
      token: token,
      user: req.user
    });
  }
);

// ===== PROTECTED API ROUTES =====

const userAuthRoutes = require('./features/users/user.route');

// ===== PROTECTED API ROUTES =====

// Mount the user authentication routes
app.use('/api', userAuthRoutes(authenticateJWT));

// ===== SERVER START =====
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Please open your browser and navigate to the address to log in.');
});
