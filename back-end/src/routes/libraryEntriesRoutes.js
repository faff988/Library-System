const router = require('express').Router();
const ctrl = require('../controllers/libraryEntriesController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', authorize('Admin', 'Librarian'), ctrl.create);
router.put('/:id', authorize('Admin', 'Librarian'), ctrl.update);
router.delete('/:id', authorize('Admin'), ctrl.remove);

module.exports = router;