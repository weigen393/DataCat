require('dotenv').config();
const dashboard = require('../models/dashboard_model');

const getListPage = async (req, res) => {
    req.body.userId = '2'; // for test
    const list = await dashboard.getBoardList(req.body.userId);
    return res.render('list', { list: list, userId: req.body.userId });
};

const getDashboardPage = async (req, res) => {
    req.body.userId = '2'; // for test
    const page = await dashboard.getDashboardPage(req.body.userId, req.params.dashboardId);
    return res.render('dashboard', { userId: req.body.userId, dashboards: page });
};

const getChartPage = async (req, res) => {
    req.body.userId = '2'; // for test
    const title = await dashboard.getDashboardTitle(req.body.userId, req.params.dashboardId);
    return res.render('chartPage', {
        userId: req.body.userId,
        dashboards: { dashboardId: req.params.dashboardId, title: title },
    });
};

module.exports = {
    getListPage,
    getDashboardPage,
    getChartPage,
};
