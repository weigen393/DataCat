require('dotenv').config();
const dashboard = require('../models/dashboard_model');

const addDashboard = async (req, res) => {
    const add = await dashboard.addDashboard(req.body);
    console.log('add dashboard');
    res.status(200).send(add);
};
const delDashboard = async (req, res) => {
    const del = await dashboard.delDashboard(req.body);
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
