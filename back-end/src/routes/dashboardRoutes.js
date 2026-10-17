const router = require('express').Router();
const ctrl = require('../controllers/dashboardController');
const {authenticate} = require('../middleware/auth');

router.get('/overview', authenticate, ctrl.overview);
router.get('/trend', authenticate, ctrl.trend);

module.exports = router;