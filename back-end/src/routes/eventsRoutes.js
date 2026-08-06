// const router = require('express').Router();
// const ctrl = require('../controllers/eventsController');
// const {authenticate, authorize} = require('../middleware/auth');

// router.get('/', ctrl.list);
// router.get('/:id', ctrl.getOne);
// router.post('/', authenticate, authorize('Admin', 'Librarian'), ctrl.create);
// router.put('/:id', authenticate, authorize('Admin', 'Librarian'), ctrl.update);
// router.delete('/:id', authenticate, authorize('Admin', 'Librarian'), ctrl.remove);

// module.exports = router;

const router = require('express').Router();
const ctrl = require('../controllers/eventsController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadEventImage } = require('../middleware/upload');

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', authenticate, authorize('Admin', 'Librarian'), uploadEventImage.single('eventImage'), ctrl.create);
router.put('/:id', authenticate, authorize('Admin', 'Librarian'), uploadEventImage.single('eventImage'), ctrl.update);
router.delete('/:id', authenticate, authorize('Admin', 'Librarian'), ctrl.remove);

module.exports = router;