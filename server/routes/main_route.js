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
const { authSession } = require('../../util/auth');
router.get('/', getHomePage);
router.get('/dashboard-list', authSession, getListPage);
router.get('/dashboards/:dashboardId', authSession, getDashboardPage);
router.get('/dashboards/:dashboardId/charts/:chartId', authSession, getChartPage);
router.get('/alert-list', authSession, getAlertList);
router.get('/alerts/:alertId', authSession, getAlertPage);
router.get('/notify-list', authSession, getNotifyList);
router.get('/notify/:notifyId', authSession, getNotifyPage);
module.exports = router;
