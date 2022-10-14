const router = require('express').Router();
const { saveAlert, delAlert, setAlert, editAlert } = require('../controllers/alert_controller');
const { authSession } = require('../../util/auth');
router.post('/alerts/save', authSession, saveAlert);
router.post('/alert-list/delete', authSession, delAlert);
router.post('/alerts/set', authSession, setAlert);
router.get('/alerts/edit', authSession, editAlert);
// router.post('/dashboards/:dashboardId/text', updateDashboardText);
module.exports = router;
