const router = require('express').Router();
const { list } = require('../controllers/dashboard_controller');

router.route('/dashboard-list/').get(list);

module.exports = router;
