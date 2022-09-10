const router = require('express').Router();

const { getListPage, getDashboardPage } = require('../controllers/page');

router.get('/dashboard-list', getListPage);
router.get('/dashboards/', getDashboardPage);

module.exports = router;
