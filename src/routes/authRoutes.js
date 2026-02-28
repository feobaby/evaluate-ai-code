const express = require('express');
const authController = require('../controllers/authController');
const { validateSignUp, validateSignIn } = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', validateSignUp, authController.signUp);
router.post('/signin', validateSignIn, authController.signIn);

router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
