const router = require('express').Router();
const { getHost, getContainer, getChart, saveChart } = require('../controllers/chart_controller');

router.get('/chart/host', getHost);
router.get('/chart/container', getContainer);
router.get('/chart/show', getChart);
router.post('/chart/save', saveChart);

module.exports = router;
