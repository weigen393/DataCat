const router = require('express').Router();
const { signUp, signIn } = require('../controllers/user_controller');

router.post('/user/signup', signUp);
router.post('/user/signin', signIn);
module.exports = router;
