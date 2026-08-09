const router = require('express').Router();
const ctrl = require('../controllers/feedbackController');
const { authenticate, authorize, requirePermission } = require('../middleware/auth');

const MODULE = 'feedback';

// Public: anyone (a library visitor) can submit feedback, no auth needed.
router.post('/', ctrl.create);

router.get('/', authenticate, authorize('Admin', 'Librarian'), requirePermission(MODULE, 'read'), ctrl.list);
router.get('/:id', authenticate, authorize('Admin', 'Librarian'), requirePermission(MODULE, 'read'), ctrl.getOne);
router.put('/:id/reply', authenticate, authorize('Admin', 'Librarian'), requirePermission(MODULE, 'update'), ctrl.setReply);
router.delete('/:id/reply', authenticate, authorize('Admin', 'Librarian'), requirePermission(MODULE, 'delete'), ctrl.removeReply);
router.delete('/:id', authenticate, authorize('Admin', 'Librarian'), requirePermission(MODULE, 'delete'), ctrl.remove);

module.exports = router;