const router = require('express').Router();
const ctrl = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/', ctrl.send);

module.exports = router;