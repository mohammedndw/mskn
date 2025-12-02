const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { signupSchema, loginSchema, ownerLoginSchema } = require('../validations/auth.validation');

// Public routes
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/owner-login', validate(ownerLoginSchema), authController.ownerLogin);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
