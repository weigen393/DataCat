const router = require('express').Router();
const {
    getHost,
    getContainer,
    getChart,
    saveChart,
    delChart,
    editChart,
    getAppField,
} = require('../controllers/chart_controller');

router.get('/chart/host', getHost);
router.get('/chart/container', getContainer);
router.get('/chart/show', getChart);
router.get('/chart/appField', getAppField);
router.post('/chart/save', saveChart);
router.post('/chart/delete', delChart);
router.get('/chart/edit', editChart);
module.exports = router;
