const router = require('express').Router();
const { saveNotify, delNotify, editNotify } = require('../controllers/notify_controller');
const { authSession } = require('../../util/auth');
router.post('/notify/save', authSession, saveNotify);
router.post('/notify-list/delete', authSession, delNotify);
router.get('/notify/edit', authSession, editNotify);
module.exports = router;
