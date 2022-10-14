const router = require('express').Router();
const { addDashboard, delDashboard, updateDashboardText } = require('../controllers/dashboard_controller');
const { authSession } = require('../../util/auth');
router.post('/dashboard-list/add', authSession, addDashboard);
router.post('/dashboard-list/delete', authSession, delDashboard);
router.post('/dashboards/:dashboardId/text', authSession, updateDashboardText);
module.exports = router;
