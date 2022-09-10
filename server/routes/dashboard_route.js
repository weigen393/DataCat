const router = require('express').Router();
const { list, addDashboard, delDashboard } = require('../controllers/dashboard_controller');

router.post('/dashboard-list/add', addDashboard);
router.post('/dashboard-list/delete', delDashboard);
module.exports = router;
