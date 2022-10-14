const router = require('express').Router();
const {
    getHost,
    getContainer,
    getChart,
    saveChart,
    delChart,
    editChart,
    getAppField,
} = require('../controllers/chart_controller');
const { authSession } = require('../../util/auth');
router.get('/chart/host', authSession, getHost);
router.get('/chart/container', authSession, getContainer);
router.get('/chart/show', authSession, getChart);
router.get('/chart/appField', authSession, getAppField);
router.post('/chart/save', authSession, saveChart);
router.post('/chart/delete', authSession, delChart);
router.get('/chart/edit', authSession, editChart);
module.exports = router;
