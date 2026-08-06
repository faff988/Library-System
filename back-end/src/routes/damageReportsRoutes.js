const router = require('express').Router();
const ctrl = require('../controllers/damageReportsController');
const {authenticate, authorize} = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', authorize('Admin', 'Librarian'), ctrl.create);
router.delete('/:id', authorize('Admin'), ctrl.remove);

module.exports = router;