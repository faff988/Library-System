const router = require('express').Router();
const ctrl = require('../controllers/donationsController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', authorize('Admin', 'Librarian'), ctrl.create);
router.put('/:id', authorize('Admin', 'Librarian'), ctrl.update);
router.delete('/:id', authorize('Admin'), ctrl.remove);
router.post('/:id/items', authorize('Admin', 'Librarian'), ctrl.addItem);
router.put('/items/:itemId', authorize('Admin', 'Librarian'), ctrl.updateItem);
router.delete('/items/:itemId', authorize('Admin', 'Librarian'), ctrl.removeItem);

module.exports = router;