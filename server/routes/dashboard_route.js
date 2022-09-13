const router = require('express').Router();
const { addDashboard, delDashboard, updateDashboardText } = require('../controllers/dashboard_controller');

router.post('/dashboard-list/add', addDashboard);
router.post('/dashboard-list/delete', delDashboard);
router.post('/dashboards/:dashboardId/text', updateDashboardText);
module.exports = router;
