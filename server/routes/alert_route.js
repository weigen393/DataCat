const router = require('express').Router();
const { saveAlert } = require('../controllers/alert_controller');

router.post('/alerts/save', saveAlert);
// router.post('/dashboard-list/delete', delDashboard);
// router.post('/dashboards/:dashboardId/text', updateDashboardText);
module.exports = router;
