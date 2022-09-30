require('dotenv').config();
const dashboard = require('../models/dashboard_model');
const alert = require('../models/alert_model');
const notify = require('../models/notify_model');

const getHomePage = async (req, res) => {
    return res.render('index');
};

const getListPage = async (req, res) => {
    console.log('id', req.session.user.id);
    const list = await dashboard.getBoardList(req.session.user.id);
    console.log(list);
    return res.render('list', { list: list, userId: req.session.user.id, userName: req.session.user.name });
};

const getDashboardPage = async (req, res) => {
    console.log(req.session.user);
    const page = await dashboard.getDashboardPage(req.body.userId, req.params.dashboardId);
    // console.log('page', page);
    return res.render('dashboard', { userName: req.session.user.name, userId: req.session.user.id, dashboards: page });
};

const getChartPage = async (req, res) => {
    console.log(req.params.dashboardId);
    const title = await dashboard.getDashboardTitle(req.session.user.id, req.params.dashboardId);

    if (req.params.chartId === 'new') {
        return res.render('chartPage', {
            userName: req.session.user.name,
            userId: req.session.user.id,
            dashboards: { dashboardId: req.params.dashboardId, title: title },
        });
    } else {
        return res.render('chartPage', {
            userName: req.session.user.name,
            userId: req.session.user.id,
            dashboards: { dashboardId: req.params.dashboardId, chartId: req.params.chartId, title: title },
        });
    }
};
const getAlertList = async (req, res) => {
    console.log('id', req.session.user.id);
    const list = await alert.getAlertList(req.session.user.id);
    console.log(list);
    return res.render('alertList', { list: list, userId: req.session.user.id, userName: req.session.user.name });
};
const getAlertPage = async (req, res) => {
    if (req.params.alertId === 'new') {
        return res.render('alertPage', {
            userName: req.session.user.name,
            userId: req.session.user.id,
            alerts: {},
        });
    } else {
        return res.render('alertPage', {
            userName: req.session.user.name,
            userId: req.session.user.id,
            alerts: { alertId: req.params.alertId },
        });
    }
};
const getNotifyList = async (req, res) => {
    console.log('id', req.session.user.id);
    const list = await notify.getNotifyList(req.session.user.id);
    console.log(list);
    return res.render('notifyList', { list: list, userId: req.session.user.id, userName: req.session.user.name });
};
const getNotifyPage = async (req, res) => {
    if (req.params.notifyId === 'new') {
        return res.render('notifyPage', {
            userName: req.session.user.name,
            userId: req.session.user.id,
            notify: {},
        });
    } else {
        return res.render('notifyPage', {
            userName: req.session.user.name,
            userId: req.session.user.id,
            notify: { notifyId: req.params.notifyId },
        });
    }
};
module.exports = {
    getHomePage,
    getListPage,
    getDashboardPage,
    getChartPage,
    getAlertList,
    getAlertPage,
    getNotifyList,
    getNotifyPage,
};
