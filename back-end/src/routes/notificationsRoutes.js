const router = require('express').Router();
const ctrl = require('../controllers/notificationsController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.list);
router.post('/', authorize('Admin'), ctrl.create);

// Static path placed before parametric /:id route to avoid route collisions
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', ctrl.markRead);

module.exports = router;