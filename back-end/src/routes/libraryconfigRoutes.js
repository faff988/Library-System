// const router = require('express').Router();
// const ctrl = require('../controllers/libraryconfigController');
// const { authenticate, authorize } = require('../middleware/auth');

// router.use(authenticate);

// router.get('/', ctrl.getConfig);
// router.put('/', authorize('Admin', 'Librarian'), ctrl.updateConfig);

// module.exports = router;

// // In your main app/router file, mount this with:
// //   app.use('/api/library-config', require('./routes/libraryConfigRoutes'));

const router = require('express').Router();
const ctrl = require('../controllers/libraryConfigController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getConfig);
router.put('/', authorize('Admin', 'Librarian'), ctrl.updateConfig);

module.exports = router;