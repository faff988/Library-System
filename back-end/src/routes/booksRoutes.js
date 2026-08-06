// const router = require('express').Router();
// const ctrl = require('../controllers/booksController');
// const { authenticate, authorize } = require('../middleware/auth');
// const upload = require('../middleware/upload');

// router.use(authenticate);

// router.get('/stats', ctrl.stats);
// router.get('/', ctrl.list);
// router.get('/options/sections', ctrl.sectionOptions);
// router.get('/:id', ctrl.getOne);
// router.get('/:id/history', ctrl.history);
// router.post('/', authorize('Admin', 'Librarian'), upload.single('coverImage'), ctrl.create);
// router.put('/:id', authorize('Admin', 'Librarian'), upload.single('coverImage'), ctrl.update);
// router.delete('/:id', authorize('Admin', 'Librarian'), ctrl.remove);

// module.exports = router;

const router = require('express').Router();
const ctrl = require('../controllers/booksController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadBookCover } = require('../middleware/upload');

router.use(authenticate);

router.get('/stats', ctrl.stats);
router.get('/', ctrl.list);
router.get('/options/sections', ctrl.sectionOptions);
router.get('/:id', ctrl.getOne);
router.get('/:id/history', ctrl.history);
router.post('/', authorize('Admin', 'Librarian'), uploadBookCover.single('coverImage'), ctrl.create);
router.put('/:id', authorize('Admin', 'Librarian'), uploadBookCover.single('coverImage'), ctrl.update);
router.delete('/:id', authorize('Admin', 'Librarian'), ctrl.remove);

module.exports = router;