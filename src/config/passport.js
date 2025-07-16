
require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../features/users/userModel');



// ===== GOOGLE OAUTH STRATEGY =====
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.CALLBACK_URL}/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile:', profile);
        const user = await User.findOrCreate(profile);
        return done(null, user);
      } catch (err) {
        console.error('Error in Google Strategy:', err);
        return done(err);
      }
    }
  )
);

// ===== GITHUB OAUTH STRATEGY =====
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.CALLBACK_URL}/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('GitHub profile:', profile);
        const user = await User.findOrCreate(profile);
        return done(null, user);
      } catch (err) {
        console.error('Error in GitHub Strategy:', err);
        return done(err);
      }
    }
  )
);

module.exports = passport;
