const router = require('express').Router();
const ctrl = require('../controllers/authController');
console.log(Object.keys(ctrl));
const{authenticate} = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', authenticate, ctrl.me);
router.put('/me', authenticate, ctrl.updateMe);
router.put('/change-password', authenticate, ctrl.changePassword);

module.exports = router;