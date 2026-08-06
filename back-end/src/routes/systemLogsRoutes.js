const router = require('express').Router();
const ctrl = require('../controllers/systemLogsController');
const {authenticate, authorize} = require('../middleware/auth');

router.get('/' , authenticate, authorize('Admin'), ctrl.list);

module.exports = router;