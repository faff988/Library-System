const router = require('express').Router();
const ctrl = require('../controllers/staffController');
const { authenticate, requirePermission } = require('../middleware/auth');

// Action names must match the keys your permissions page saves.
// If it saves "edit" instead of "update", change UPDATE below.
const MODULE = 'staff';
const CREATE = 'create';
const UPDATE = 'update';
const DELETE = 'delete';

router.use(authenticate);

// Viewing: open to every logged-in user (requirePermission allows 'read').
router.get('/',    requirePermission(MODULE, 'read'), ctrl.list);
router.get('/:id', requirePermission(MODULE, 'read'), ctrl.getOne);

// Write actions follow the permissions the admin sets.
router.post('/',            requirePermission(MODULE, CREATE), ctrl.create);
router.put('/:id',          requirePermission(MODULE, UPDATE), ctrl.update);
router.patch('/:id/status', requirePermission(MODULE, UPDATE), ctrl.setStatus);
router.delete('/:id',       requirePermission(MODULE, DELETE), ctrl.remove);

module.exports = router;