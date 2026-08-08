const router = require('express').Router();
const ctrl = require('../controllers/donationsController');
const { authenticate, authorize, requirePermission } = require('../middleware/auth');

const MODULE = 'donations';

router.use(authenticate);
router.get('/', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'read'), ctrl.list);
router.get('/:id', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'read'), ctrl.getOne);
router.post('/', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'create'), ctrl.create);
router.put('/:id', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'update'), ctrl.update);
router.delete('/:id', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'delete'), ctrl.remove);
router.post('/:id/items', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'update'), ctrl.addItem);
router.put('/items/:itemId', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'update'), ctrl.updateItem);
router.delete('/items/:itemId', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'delete'), ctrl.removeItem);

module.exports = router;