const router = require('express').Router();
const ctrl = require('../controllers/membershipTypesController');
const {authenticate, authorize} = require('../middleware/auth');

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', authenticate, authorize('Admin'), ctrl.create);
router.put('/:id', authenticate, authorize('Admin'), ctrl.update);
router.delete('/:id', authenticate, authorize('Admin'), ctrl.remove);

module.exports = router;