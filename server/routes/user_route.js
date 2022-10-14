const router = require('express').Router();
const { signUp, signIn, logout } = require('../controllers/user_controller');

router.post('/user/signup', signUp);
router.post('/user/signin', signIn);
router.post('/user/logout', logout);
module.exports = router;
