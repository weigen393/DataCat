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
    res.status(200).send(req.body);
};

module.exports = {
    addDashboard,
    delDashboard,
};
