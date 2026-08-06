const router = require('express').Router();
const ctrl = require('../controllers/rolesController');
const {authenticate, authorize} = require('../middleware/auth');

router.get('/', authenticate, ctrl.list);
router.post('/', authenticate, authorize('Admin'), ctrl.create);

module.exports = router;