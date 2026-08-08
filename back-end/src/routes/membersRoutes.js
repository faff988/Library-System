const router = require('express').Router();
const ctrl = require('../controllers/membersController');
const {authenticate, authorize, requirePermission} = require('../middleware/auth');

const MODULE = 'members';

router.use(authenticate);
router.get('/', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'read'), ctrl.list);
router.get('/:id', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'read'), ctrl.getOne);
router.post('/', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'create'), ctrl.create);
router.put('/:id', authorize('Admin','Librarian'), requirePermission(MODULE, 'update'), ctrl.update);
router.patch('/:id/status', authorize('Admin','Librarian'), requirePermission(MODULE, 'update'), ctrl.setStatus);
router.delete('/:id', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'delete'), ctrl.remove);

module.exports = router;