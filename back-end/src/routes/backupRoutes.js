const router = require('express').Router();
const ctrl = require('../controllers/backupController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('Admin', 'Librarian')); // see note above re: restore risk — consider Admin-only for restore specifically
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:filename/download', ctrl.download);
router.post('/:filename/restore', ctrl.restore);
router.delete('/:filename', ctrl.remove);

module.exports = router;