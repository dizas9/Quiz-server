const express = require('express');
const userController = require('./userController');
const router = express.Router();

// We will pass the authenticateJWT middleware from index.js
module.exports = (authenticateJWT) => {
  router.get('/profile', authenticateJWT, userController.getUserProfile);
  router.get('/users', authenticateJWT, userController.getAllUsers);

  return router;
};