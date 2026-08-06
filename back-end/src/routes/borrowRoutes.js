const router = require('express').Router();
const ctrl = require('../controllers/borrowRecordsController');
const{ authenticate, authorize} = require('../middleware/auth');

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', authorize('Admin', 'Librarian'), ctrl.create);
router.put('/:id/return', authorize('Admin', 'Librarian'), ctrl.returnBook);
router.post('/refresh-overdue', authorize('Admin', 'Librarian'), ctrl.refreshOverdue);

router.post('/', ctrl.create);
router.put('/:id/return', ctrl.returnBook);
router.post('/refresh-overdue', ctrl.refreshOverdue);

module.exports = router;