const router = require('express').Router();

const { getListPage, getDashboardPage, getChartPage } = require('../controllers/page');

router.get('/dashboard-list', getListPage);
router.get('/dashboards/:dashboardId', getDashboardPage);
router.get('/dashboards/:dashboardId/charts/:chartId', getChartPage);
module.exports = router;
