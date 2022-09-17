const router = require('express').Router();
const { signUp, signIn } = require('../controllers/user_controller');

router.post('/user/signup', signUp); //TODO: validation before here
router.post('/user/signin', signIn); //TODO: validation before here
module.exports = router;
