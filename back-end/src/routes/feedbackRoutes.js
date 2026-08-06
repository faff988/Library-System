const router = require('express').Router();
const ctrl = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', ctrl.create);
router.get('/', authenticate, ctrl.list);
router.get('/:id', authenticate, ctrl.getOne);
router.put('/:id/reply', authenticate, authorize('Admin', 'Librarian'), ctrl.setReply);
router.delete('/:id/reply', authenticate, authorize('Admin', 'Librarian'), ctrl.removeReply);
router.delete('/:id', authenticate, authorize('Admin'), ctrl.remove);

module.exports = router;