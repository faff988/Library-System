const router = require('express').Router();
const ctrl = require('../controllers/membersController');
const { authenticate, authorize, requirePermission } = require('../middleware/auth');

const MODULE = 'members';

router.use(authenticate);
router.use(authorize('Admin', 'Librarian'));

router.get('/',    requirePermission(MODULE, 'read'), ctrl.list);
router.get('/:id', requirePermission(MODULE, 'read'), ctrl.getOne);

router.post('/',            requirePermission(MODULE, 'create'), ctrl.create);
router.put('/:id',          requirePermission(MODULE, 'update'), ctrl.update);
router.patch('/:id/status', requirePermission(MODULE, 'update'), ctrl.setStatus);
router.delete('/:id',       requirePermission(MODULE, 'delete'), ctrl.remove);

module.exports = router;