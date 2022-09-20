require('dotenv').config();
const dashboard = require('../models/dashboard_model');

const addDashboard = async (req, res) => {
    console.log(typeof req.session);
    console.log(req.session);
    const add = await dashboard.addDashboard(req.body, req.session.user.id);

    console.log('add dashboard');
    res.status(200).send(add);
};
const delDashboard = async (req, res) => {
    const del = await dashboard.delDashboard(req.body, req.session.user.id);
    console.log('delete dashboard');
    res.status(200).send('delete');
};
const updateDashboardText = async (req, res) => {
    const text = await dashboard.updateDashboardText(req.params.dashboardId, req.body);
    console.log('update dashboard text');
    res.status(200).send('update');
};

module.exports = {
    addDashboard,
    delDashboard,
    updateDashboardText,
};
