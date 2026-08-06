const router = require('express').Router();
const ctrl = require('../controllers/usersController');
const {authenticate, authorize} = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('Admin'), ctrl.list);
router.get('/:id', authorize('Admin'), ctrl.getOne);
router.post('/', authorize('Admin'), ctrl.create);
router.put('/:id', authorize('Admin'), ctrl.update);
router.patch('/:id/status', authorize('Admin'), ctrl.setActive);
router.delete('/:id', authorize('Admin'), ctrl.remove);

module.exports = router;