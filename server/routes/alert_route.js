const router = require('express').Router();
const { saveAlert, delAlert, setAlert, editAlert } = require('../controllers/alert_controller');

router.post('/alerts/save', saveAlert);
router.post('/alert-list/delete', delAlert);
router.post('/alerts/set', setAlert);
router.get('/alerts/edit', editAlert);
// router.post('/dashboards/:dashboardId/text', updateDashboardText);
module.exports = router;
