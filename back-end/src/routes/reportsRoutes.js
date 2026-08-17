const router = require('express').Router();
const ctrl = require('../controllers/reportsController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/popular-books', ctrl.popularBooks);
router.get('/book-inventory', ctrl.bookInventory);
router.get('/borrow-return', ctrl.borrowReturn);
router.get('/transactions', ctrl.transactions);
router.get('/entries', ctrl.entries);
router.get('/members', ctrl.members);
router.get('/staff-activity', ctrl.staffActivity);
router.get('/lost-damaged', ctrl.lostDamaged);

module.exports = router;