const router = require('express').Router();

const {
    getHomePage,
    getListPage,
    getDashboardPage,
    getChartPage,
    getAlertList,
    getAlertPage,
    getNotifyList,
    getNotifyPage,
} = require('../controllers/page');

router.get('/', getHomePage);
router.get('/dashboard-list', getListPage);
router.get('/dashboards/:dashboardId', getDashboardPage);
router.get('/dashboards/:dashboardId/charts/:chartId', getChartPage);
router.get('/alert-list', getAlertList);
router.get('/alerts/:alertId', getAlertPage);
router.get('/notify-list', getNotifyList);
router.get('/notify/:notifyId', getNotifyPage);
module.exports = router;
