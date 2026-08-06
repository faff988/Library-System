const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken } = require('../middlewares/authMiddleware'); // Your JWT middleware

// Auth & User Security Routes
router.get('/auth/me', verifyToken, settingsController.getCurrentUser);
router.put('/auth/change-password', verifyToken, settingsController.changePassword);

// System / Library Config Routes
router.get('/settings/config', verifyToken, settingsController.getLibraryConfig);
router.put('/settings/config', verifyToken, settingsController.updateLibraryConfig);

module.exports = router;