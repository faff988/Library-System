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
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const { uploadBookCover } = require('../middleware/upload');

const MODULE = 'inventory';

router.use(authenticate);

// Reads: any authenticated Admin/Librarian can view (permissions default to
// read:true), but requirePermission still fails closed if a librarian's
// permissions object explicitly has inventory.read = false.
router.get('/stats', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'read'), ctrl.stats);
router.get('/', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'read'), ctrl.list);
router.get('/options/sections', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'read'), ctrl.sectionOptions);
router.get('/:id', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'read'), ctrl.getOne);
router.get('/:id/history', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'read'), ctrl.history);

router.post('/', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'create'), uploadBookCover.single('coverImage'), ctrl.create);
router.put('/:id', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'update'), uploadBookCover.single('coverImage'), ctrl.update);
router.delete('/:id', authorize('Admin', 'Librarian'), requirePermission(MODULE, 'delete'), ctrl.remove);

module.exports = router;